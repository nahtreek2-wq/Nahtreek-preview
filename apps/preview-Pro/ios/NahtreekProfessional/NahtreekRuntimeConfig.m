#import <React/RCTBridgeModule.h>
#import <Security/Security.h>
#import <CoreLocation/CoreLocation.h>
#import <TargetConditionals.h>

@interface NahtreekRuntimeConfig : NSObject <RCTBridgeModule>
@end

// One-shot GPS fix. Mirrors the Android currentLocation() contract:
// same result shape and error codes.
@interface NahtreekLocationFetcher : NSObject <CLLocationManagerDelegate>
@property (nonatomic, copy) RCTPromiseResolveBlock resolve;
@property (nonatomic, copy) RCTPromiseRejectBlock reject;
@property (nonatomic, strong) CLLocationManager *manager;
@property (nonatomic, strong) NSTimer *timeout;
@property (nonatomic, assign) BOOL finished;
- (void)start;
- (void)finishWithLocation:(CLLocation *)location error:(NSError *)error;
@end

@implementation NahtreekLocationFetcher

- (void)start
{
  dispatch_async(dispatch_get_main_queue(), ^{
    self.manager = [[CLLocationManager alloc] init];
    self.manager.delegate = self;
    self.manager.desiredAccuracy = kCLLocationAccuracyHundredMeters;
    self.timeout = [NSTimer scheduledTimerWithTimeInterval:20.0
                                                   repeats:NO
                                                     block:^(__unused NSTimer *t) {
      [self finishWithLocation:nil error:[NSError errorWithDomain:@"NahtreekLocation"
                                                             code:1
                                                         userInfo:@{NSLocalizedDescriptionKey: @"timeout"}]];
    }];
    CLAuthorizationStatus status = self.manager.authorizationStatus;
    if (status == kCLAuthorizationStatusNotDetermined) {
      [self.manager requestWhenInUseAuthorization];
    } else if (status == kCLAuthorizationStatusAuthorizedWhenInUse ||
               status == kCLAuthorizationStatusAuthorizedAlways) {
      [self.manager requestLocation];
    } else {
      [self finishWithLocation:nil error:[NSError errorWithDomain:@"NahtreekLocation"
                                                             code:2
                                                         userInfo:@{NSLocalizedDescriptionKey: @"denied"}]];
    }
  });
}

- (void)locationManagerDidChangeAuthorization:(CLLocationManager *)manager
{
  if (self.finished) return;
  CLAuthorizationStatus status = manager.authorizationStatus;
  if (status == kCLAuthorizationStatusAuthorizedWhenInUse ||
      status == kCLAuthorizationStatusAuthorizedAlways) {
    [manager requestLocation];
  } else if (status == kCLAuthorizationStatusDenied || status == kCLAuthorizationStatusRestricted) {
    [self finishWithLocation:nil error:[NSError errorWithDomain:@"NahtreekLocation"
                                                           code:2
                                                       userInfo:@{NSLocalizedDescriptionKey: @"denied"}]];
  }
}

- (void)locationManager:(__unused CLLocationManager *)manager didUpdateLocations:(NSArray<CLLocation *> *)locations
{
  [self finishWithLocation:locations.lastObject error:nil];
}

- (void)locationManager:(__unused CLLocationManager *)manager didFailWithError:(NSError *)error
{
  [self finishWithLocation:nil error:error];
}

- (void)finishWithLocation:(CLLocation *)location error:(NSError *)error
{
  if (self.finished) return;
  self.finished = YES;
  dispatch_async(dispatch_get_main_queue(), ^{
    [self.timeout invalidate];
    self.timeout = nil;
    [self.manager stopUpdatingLocation];
  });
  if (!location) {
    if ([error.domain isEqualToString:@"NahtreekLocation"] && error.code == 2) {
      self.reject(@"LOCATION_PERMISSION", @"Allow location so nearby customers can find you and follow your visit.", nil);
    } else if ([error.domain isEqualToString:@"NahtreekLocation"] && error.code == 1) {
      self.reject(@"LOCATION_TIMEOUT", @"Could not get your location. Try again outdoors.", nil);
    } else {
      self.reject(@"LOCATION_EMPTY", @"Could not get your location. Try again.", nil);
    }
    return;
  }
  if (location.horizontalAccuracy < 0 || location.horizontalAccuracy > 200) {
    self.reject(@"LOCATION_IMPRECISE", @"Location is not accurate enough for nearby jobs. Try again outdoors.", nil);
    return;
  }
  NSISO8601DateFormatter *iso = [[NSISO8601DateFormatter alloc] init];
  self.resolve(@{@"latitude": @(location.coordinate.latitude),
                 @"longitude": @(location.coordinate.longitude),
                 @"accuracy": @(location.horizontalAccuracy),
                 @"observedAt": [iso stringFromDate:location.timestamp],
                 @"isMock": @NO,
                 @"address": @"Current location", @"city": @"", @"state": @""});
}

@end

// Background journey sharing. Mirrors the Android LiveLocationService:
// posts fixes to /service-workflow/presence at most every 10s, only when
// accurate (<=100m) and fresh (<=120s), and stops on 401/403.
@interface NahtreekLiveLocation : NSObject <CLLocationManagerDelegate>
@property (nonatomic, strong) CLLocationManager *manager;
@property (nonatomic, copy) NSString *token;
@property (nonatomic, assign) BOOL running;
@property (nonatomic, copy) NSString *error;
@property (nonatomic, assign) NSTimeInterval lastSent;
@property (nonatomic, assign) BOOL sending;
- (void)startWithToken:(NSString *)token;
- (void)stop;
- (void)publishLocation:(CLLocation *)location online:(BOOL)online bearer:(NSString *)bearer;
@end

@implementation NahtreekLiveLocation

- (NSString *)apiBaseUrl
{
  NSString *url = NSBundle.mainBundle.infoDictionary[@"NahtreekAPIBaseURL"];
  if (![url isKindOfClass:NSString.class] || [url containsString:@"$("]) return @"";
  while ([url hasSuffix:@"/"]) url = [url substringToIndex:url.length - 1];
  return url;
}

- (void)startWithToken:(NSString *)token
{
  dispatch_async(dispatch_get_main_queue(), ^{
    if (!self.manager) {
      self.manager = [[CLLocationManager alloc] init];
      self.manager.delegate = self;
      self.manager.desiredAccuracy = kCLLocationAccuracyHundredMeters;
      self.manager.allowsBackgroundLocationUpdates = YES;
      self.manager.pausesLocationUpdatesAutomatically = NO;
    }
    self.token = token;
    self.error = @"";
    CLAuthorizationStatus status = self.manager.authorizationStatus;
    if (status == kCLAuthorizationStatusNotDetermined) {
      [self.manager requestAlwaysAuthorization];
    }
    [self.manager startUpdatingLocation];
    self.running = YES;
  });
}

- (void)stop
{
  NSString *bearer = self.token ?: @"";
  self.token = @"";
  self.running = NO;
  dispatch_async(dispatch_get_main_queue(), ^{
    [self.manager stopUpdatingLocation];
  });
  CLLocation *last = self.manager.location;
  if (last && bearer.length) [self publishLocation:last online:NO bearer:bearer];
}

- (void)locationManager:(__unused CLLocationManager *)manager didUpdateLocations:(NSArray<CLLocation *> *)locations
{
  if (!self.running) return;
  CLLocation *location = locations.lastObject;
  if (!location || location.horizontalAccuracy < 0 || location.horizontalAccuracy > 100) return;
  NSTimeInterval now = [[NSDate date] timeIntervalSince1970];
  if (now - [location.timestamp timeIntervalSince1970] > 120) return;
  if (now - self.lastSent < 10 || self.sending || !self.token.length) return;
  self.lastSent = now;
  self.sending = YES;
  [self publishLocation:location online:YES bearer:self.token];
}

- (void)locationManager:(__unused CLLocationManager *)manager didFailWithError:(NSError *)error
{
  if ([error.domain isEqualToString:kCLErrorDomain] && error.code == kCLErrorDenied) {
    self.error = @"Turn on location to keep work location up to date.";
  }
}

- (void)publishLocation:(CLLocation *)location online:(BOOL)online bearer:(NSString *)bearer
{
  NSString *base = [self apiBaseUrl];
  NSURL *url = [NSURL URLWithString:[base stringByAppendingString:@"/service-workflow/presence"]];
  if (![url.scheme isEqualToString:@"https"]) {
    self.error = @"Secure endpoint required for work location.";
    self.sending = NO;
    return;
  }
  NSISO8601DateFormatter *iso = [[NSISO8601DateFormatter alloc] init];
  NSDictionary *body = @{@"online": @(online), @"latitude": @(location.coordinate.latitude),
    @"longitude": @(location.coordinate.longitude), @"accuracy": @(location.horizontalAccuracy),
    @"observedAt": [iso stringFromDate:location.timestamp]};
  NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
  request.HTTPMethod = @"POST";
  request.timeoutInterval = 7;
  [request setValue:[@"Bearer " stringByAppendingString:bearer] forHTTPHeaderField:@"Authorization"];
  [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
  request.HTTPBody = [NSJSONSerialization dataWithJSONObject:body options:0 error:NULL];
  NSURLSessionDataTask *task = [[NSURLSession sharedSession] dataTaskWithRequest:request
    completionHandler:^(__unused NSData *data, NSURLResponse *response, NSError *error) {
      self.sending = NO;
      if (error) {
        self.error = @"Connection interrupted. Your last position will be marked stale.";
        return;
      }
      NSInteger status = [(NSHTTPURLResponse *)response statusCode];
      if (status == 401 || status == 403) {
        self.error = @"Session expired. Open NAHTREEK and go online again.";
        [self stop];
      } else if (status == 409) {
        self.error = @"Location sharing stopped because there is no active service visit.";
        [self stop];
      } else if (status < 200 || status >= 300) {
        self.error = @"Work location was not accepted. Check availability and GPS in the app.";
      } else {
        self.error = @"";
      }
    }];
  [task resume];
}

@end

@implementation NahtreekRuntimeConfig {
  NSMutableSet<NahtreekLocationFetcher *> *_activeFetchers;
  NahtreekLiveLocation *_live;
}

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup { return NO; }

- (instancetype)init
{
  if ((self = [super init])) {
    _activeFetchers = [NSMutableSet set];
    _live = [[NahtreekLiveLocation alloc] init];
  }
  return self;
}

RCT_REMAP_METHOD(currentLocation,
                 currentLocationWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NahtreekLocationFetcher *fetcher = [[NahtreekLocationFetcher alloc] init];
  [_activeFetchers addObject:fetcher];
  __weak typeof(self) weakSelf = self;
  __weak typeof(fetcher) weakFetcher = fetcher;
  RCTPromiseResolveBlock chainedResolve = [resolve copy];
  RCTPromiseRejectBlock chainedReject = [reject copy];
  fetcher.resolve = ^(id result) {
    __strong typeof(weakSelf) strongSelf = weakSelf;
    [strongSelf->_activeFetchers removeObject:weakFetcher];
    chainedResolve(result);
  };
  fetcher.reject = ^(NSString *code, NSString *message, NSError *error) {
    __strong typeof(weakSelf) strongSelf = weakSelf;
    [strongSelf->_activeFetchers removeObject:weakFetcher];
    chainedReject(code, message, error);
  };
  [fetcher start];
}

RCT_REMAP_METHOD(startLiveLocation,
                 startLiveLocation:(NSString *)token
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(__unused RCTPromiseRejectBlock)reject)
{
  [_live startWithToken:token ?: @""];
  resolve(nil);
}

RCT_REMAP_METHOD(stopLiveLocation,
                 stopLiveLocationWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(__unused RCTPromiseRejectBlock)reject)
{
  [_live stop];
  resolve(nil);
}

RCT_REMAP_METHOD(liveLocationStatus,
                 liveLocationStatusWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(__unused RCTPromiseRejectBlock)reject)
{
  resolve(@{@"running": @(_live.running), @"error": _live.error ?: @""});
}

RCT_REMAP_METHOD(updateLiveLocationToken,
                 updateLiveLocationToken:(NSString *)token
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(__unused RCTPromiseRejectBlock)reject)
{
  if (_live.running) _live.token = token ?: @"";
  resolve(nil);
}

- (NSDictionary *)constantsToExport
{
  NSDictionary *info = NSBundle.mainBundle.infoDictionary;
  NSString *environment = info[@"NahtreekEnvironment"];
  if (![@[@"development", @"staging", @"production"] containsObject:environment]) {
#if DEBUG
    environment = @"development";
#else
    environment = @"production";
#endif
  }
  NSString *url = info[@"NahtreekAPIBaseURL"];
  if (![url isKindOfClass:NSString.class] || [url containsString:@"$("]) url = @"";
  return @{@"environment": environment, @"apiBaseUrl": url,
           @"deviceCompromised": @([self deviceCompromised])};
}

- (BOOL)deviceCompromised
{
#if TARGET_OS_SIMULATOR
  return NO;
#else
  // Best-effort jailbreak signal: known artifacts plus a sandbox-escape
  // probe. The app only shows a dismissible warning — never blocks.
  NSArray<NSString *> *paths = @[@"/Applications/Cydia.app",
      @"/Library/MobileSubstrate/MobileSubstrate.dylib",
      @"/bin/bash", @"/usr/sbin/sshd", @"/etc/apt",
      @"/private/var/lib/apt/"];
  NSFileManager *files = [NSFileManager defaultManager];
  for (NSString *path in paths) {
    if ([files fileExistsAtPath:path]) return YES;
  }
  NSString *probe = @"/private/nahtreek_jb_probe";
  if ([@"x" writeToFile:probe atomically:YES encoding:NSUTF8StringEncoding error:NULL]) {
    [files removeItemAtPath:probe error:NULL];
    return YES;
  }
  return NO;
#endif
}

- (NSDictionary *)sessionQuery
{
  return @{(__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
           (__bridge id)kSecAttrService: [NSBundle.mainBundle.bundleIdentifier stringByAppendingString:@".session"],
           (__bridge id)kSecAttrAccount: @"professional-session-v1",
           (__bridge id)kSecAttrSynchronizable: @NO};
}

RCT_REMAP_METHOD(getSecureSession,
                 getSecureSessionWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSMutableDictionary *query = [[self sessionQuery] mutableCopy];
  query[(__bridge id)kSecReturnData] = @YES;
  query[(__bridge id)kSecMatchLimit] = (__bridge id)kSecMatchLimitOne;
  CFTypeRef result = NULL;
  OSStatus status = SecItemCopyMatching((__bridge CFDictionaryRef)query, &result);
  if (status == errSecItemNotFound) { resolve(nil); return; }
  if (status != errSecSuccess) {
    reject(@"SECURE_SESSION_READ", @"Secure session storage is unavailable.", nil);
    return;
  }
  NSData *data = CFBridgingRelease(result);
  NSString *payload = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
  if (!payload) {
    reject(@"SECURE_SESSION_DATA", @"The saved session could not be read.", nil);
    return;
  }
  resolve(payload);
}

RCT_REMAP_METHOD(setSecureSession,
                 setSecureSession:(NSString *)payload
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSData *data = [payload dataUsingEncoding:NSUTF8StringEncoding];
  if (!data) { reject(@"SECURE_SESSION_DATA", @"The session could not be saved.", nil); return; }
  NSDictionary *attributes = @{(__bridge id)kSecValueData: data,
    (__bridge id)kSecAttrAccessible: (__bridge id)kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly};
  OSStatus status = SecItemUpdate((__bridge CFDictionaryRef)[self sessionQuery],
                                 (__bridge CFDictionaryRef)attributes);
  if (status == errSecItemNotFound) {
    NSMutableDictionary *item = [[self sessionQuery] mutableCopy];
    [item addEntriesFromDictionary:attributes];
    status = SecItemAdd((__bridge CFDictionaryRef)item, NULL);
  }
  if (status != errSecSuccess) {
    reject(@"SECURE_SESSION_WRITE", @"The session could not be saved securely.", nil);
    return;
  }
  resolve(nil);
}

RCT_REMAP_METHOD(clearSecureSession,
                 clearSecureSessionWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  OSStatus status = SecItemDelete((__bridge CFDictionaryRef)[self sessionQuery]);
  if (status != errSecSuccess && status != errSecItemNotFound) {
    reject(@"SECURE_SESSION_CLEAR", @"The saved session could not be removed.", nil);
    return;
  }
  resolve(nil);
}
@end
