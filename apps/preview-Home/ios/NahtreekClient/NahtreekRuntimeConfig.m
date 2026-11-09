#import <React/RCTBridgeModule.h>
#import <Security/Security.h>
#import <CoreLocation/CoreLocation.h>
#import <TargetConditionals.h>

@interface NahtreekRuntimeConfig : NSObject <RCTBridgeModule>
@end

// One-shot GPS fix with reverse geocoding. Mirrors the Android
// currentLocation() contract: same result shape and error codes.
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
      self.reject(@"LOCATION_PERMISSION", @"Location permission is required. You can also search manually.", nil);
    } else if ([error.domain isEqualToString:@"NahtreekLocation"] && error.code == 1) {
      self.reject(@"LOCATION_TIMEOUT", @"Could not get your location. Search manually or try again.", nil);
    } else {
      self.reject(@"LOCATION_EMPTY", @"Could not get your location. Search manually.", nil);
    }
    return;
  }
  if (location.horizontalAccuracy < 0 || location.horizontalAccuracy > 200) {
    self.reject(@"LOCATION_IMPRECISE", @"Location is not accurate enough for a work address. Try again outdoors or search for your address.", nil);
    return;
  }
  CLGeocoder *geocoder = [[CLGeocoder alloc] init];
  [geocoder reverseGeocodeLocation:location
                 completionHandler:^(NSArray<CLPlacemark *> *placemarks, __unused NSError *geocodeError) {
    CLPlacemark *mark = placemarks.firstObject;
    NSString *city = mark.locality ?: mark.subAdministrativeArea ?: @"";
    NSString *state = mark.administrativeArea ?: @"";
    NSString *address = [NahtreekLocationFetcher composedAddressFromPlacemark:mark
                                                                     latitude:location.coordinate.latitude
                                                                    longitude:location.coordinate.longitude];
    self.resolve(@{@"latitude": @(location.coordinate.latitude),
                   @"longitude": @(location.coordinate.longitude),
                   @"address": address, @"city": city, @"state": state});
  }];
}

+ (NSString *)composedAddressFromPlacemark:(CLPlacemark *)mark latitude:(double)latitude longitude:(double)longitude
{
  if (!mark) return [NSString stringWithFormat:@"Pinned location (%f, %f)", latitude, longitude];
  NSMutableArray<NSString *> *parts = [NSMutableArray array];
  NSString *street = [@[mark.subThoroughfare ?: @"", mark.thoroughfare ?: @""]
      componentsJoinedByString:@" "];
  street = [street stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
  if (street.length) [parts addObject:street];
  else if (mark.name.length) [parts addObject:mark.name];
  if (mark.locality.length) [parts addObject:mark.locality];
  if (mark.administrativeArea.length) [parts addObject:mark.administrativeArea];
  if (mark.postalCode.length) [parts addObject:mark.postalCode];
  if (mark.country.length) [parts addObject:mark.country];
  if (!parts.count) return [NSString stringWithFormat:@"Pinned location (%f, %f)", latitude, longitude];
  return [parts componentsJoinedByString:@", "];
}

@end

@implementation NahtreekRuntimeConfig {
  NSMutableSet<NahtreekLocationFetcher *> *_activeFetchers;
}

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup { return NO; }

- (instancetype)init
{
  if ((self = [super init])) {
    _activeFetchers = [NSMutableSet set];
  }
  return self;
}

- (NSString *)geoapifyKey
{
  NSString *key = NSBundle.mainBundle.infoDictionary[@"NahtreekGeoapifyKey"];
  if (![key isKindOfClass:NSString.class] || [key containsString:@"$("] ||
      [key containsString:@"PLACEHOLDER"]) return @"";
  return key;
}

RCT_REMAP_METHOD(getStaticMapUrl,
                 getStaticMapUrl:(double)latitude
                 longitude:(double)longitude
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  if (!isfinite(latitude) || !isfinite(longitude) ||
      latitude < -90.0 || latitude > 90.0 || longitude < -180.0 || longitude > 180.0) {
    reject(@"MAP_COORDINATES", @"This location is not available yet.", nil);
    return;
  }
  NSString *key = [self geoapifyKey];
  if (!key.length) {
    reject(@"MAP_CONFIG", @"Map is not configured in this build.", nil);
    return;
  }
  NSURLComponents *components = [NSURLComponents componentsWithString:@"https://maps.geoapify.com/v1/staticmap"];
  components.queryItems = @[
    [NSURLQueryItem queryItemWithName:@"style" value:@"carto"],
    [NSURLQueryItem queryItemWithName:@"width" value:@"600"],
    [NSURLQueryItem queryItemWithName:@"height" value:@"800"],
    [NSURLQueryItem queryItemWithName:@"center" value:[NSString stringWithFormat:@"lonlat:%f,%f", longitude, latitude]],
    [NSURLQueryItem queryItemWithName:@"zoom" value:@"15"],
    [NSURLQueryItem queryItemWithName:@"apiKey" value:key],
  ];
  resolve(components.URL.absoluteString);
}

RCT_REMAP_METHOD(searchLocations,
                 searchLocations:(NSString *)query
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *text = [query stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
  if (text.length < 3) {
    reject(@"LOCATION_QUERY", @"Enter at least three characters", nil);
    return;
  }
  NSString *key = [self geoapifyKey];
  if (!key.length) {
    [self systemSearchLocations:text resolver:resolve rejecter:reject];
    return;
  }
  NSURLComponents *components = [NSURLComponents componentsWithString:@"https://api.geoapify.com/v1/geocode/search"];
  components.queryItems = @[
    [NSURLQueryItem queryItemWithName:@"text" value:text],
    [NSURLQueryItem queryItemWithName:@"filter" value:@"countrycode:in"],
    [NSURLQueryItem queryItemWithName:@"limit" value:@"5"],
    [NSURLQueryItem queryItemWithName:@"format" value:@"json"],
    [NSURLQueryItem queryItemWithName:@"apiKey" value:key],
  ];
  NSURLRequest *request = [NSURLRequest requestWithURL:components.URL
                                           cachePolicy:NSURLRequestReloadIgnoringCacheData
                                       timeoutInterval:7.0];
  [[[NSURLSession sharedSession] dataTaskWithRequest:request
                                   completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
    NSArray *mapped = nil;
    if (!error && ((NSHTTPURLResponse *)response).statusCode == 200 && data) {
      NSDictionary *payload = [NSJSONSerialization JSONObjectWithData:data options:0 error:NULL];
      if ([payload isKindOfClass:NSDictionary.class]) {
        NSArray *results = payload[@"results"];
        if ([results isKindOfClass:NSArray.class] && results.count) {
          NSMutableArray *out = [NSMutableArray array];
          for (id item in results) {
            if (![item isKindOfClass:NSDictionary.class]) continue;
            double lat = [item[@"lat"] doubleValue];
            double lon = [item[@"lon"] doubleValue];
            if (!isfinite(lat) || !isfinite(lon)) continue;
            NSString *city = item[@"city"];
            if (![city isKindOfClass:NSString.class] || !city.length) city = item[@"county"];
            if (![city isKindOfClass:NSString.class]) city = @"";
            NSString *state = item[@"state"];
            if (![state isKindOfClass:NSString.class]) state = @"";
            NSString *address = item[@"formatted"];
            if (![address isKindOfClass:NSString.class] || !address.length) address = text;
            [out addObject:@{@"address": address, @"city": city, @"state": state,
                              @"latitude": @(lat), @"longitude": @(lon)}];
          }
          if (out.count) mapped = out;
        }
      }
    }
    if (mapped) resolve(mapped);
    else [self systemSearchLocations:text resolver:resolve rejecter:reject];
  }] resume];
}

- (void)systemSearchLocations:(NSString *)text
                     resolver:(RCTPromiseResolveBlock)resolve
                     rejecter:(RCTPromiseRejectBlock)reject
{
  [[[CLGeocoder alloc] init] geocodeAddressString:text
                                completionHandler:^(NSArray<CLPlacemark *> *placemarks, NSError *error) {
    if (error || !placemarks.count) {
      reject(@"LOCATION_SEARCH", @"Location search is unavailable. Please try again.", nil);
      return;
    }
    NSMutableArray *out = [NSMutableArray array];
    for (CLPlacemark *mark in [placemarks subarrayWithRange:NSMakeRange(0, MIN(5, placemarks.count))]) {
      [out addObject:@{
        @"address": [NahtreekLocationFetcher composedAddressFromPlacemark:mark
                                                                 latitude:mark.location.coordinate.latitude
                                                                longitude:mark.location.coordinate.longitude],
        @"city": mark.locality ?: mark.subAdministrativeArea ?: @"",
        @"state": mark.administrativeArea ?: @"",
        @"latitude": @(mark.location.coordinate.latitude),
        @"longitude": @(mark.location.coordinate.longitude)}];
    }
    resolve(out);
  }];
}

RCT_REMAP_METHOD(currentLocation,
                 currentLocationWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NahtreekLocationFetcher *fetcher = [[NahtreekLocationFetcher alloc] init];
  fetcher.resolve = resolve;
  fetcher.reject = reject;
  [_activeFetchers addObject:fetcher];
  __weak typeof(self) weakSelf = self;
  __weak typeof(fetcher) weakFetcher = fetcher;
  // The fetcher retains itself in the active set until either callback fires.
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

- (NSDictionary *)sessionQuery
{
  return @{(__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
           (__bridge id)kSecAttrService: [NSBundle.mainBundle.bundleIdentifier stringByAppendingString:@".session"],
           (__bridge id)kSecAttrAccount: @"client-session-v1",
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
