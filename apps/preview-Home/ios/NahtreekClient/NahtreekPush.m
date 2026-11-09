#import "NahtreekPush.h"

#import <React/RCTBridgeModule.h>
#import <UIKit/UIKit.h>

static NSDictionary *NahtreekPushInitialPayload = nil;
static NSString *const NahtreekPushEnabledKey = @"nahtreek_push_enabled";
static NSString *const NahtreekPushLastTokenKey = @"nahtreek_push_last_token";

static NSArray<NSString *> *NahtreekPushPayloadKeys(void)
{
  // Same deep-link keys as Android extrasPayload so one server payload drives both apps.
  return @[@"destination", @"conversationId", @"serviceRequestId", @"senderName", @"notificationId", @"kind"];
}

@interface NahtreekPush () <UNUserNotificationCenterDelegate>
@property (nonatomic, copy) RCTPromiseResolveBlock pendingTokenResolve;
@property (nonatomic, copy) RCTPromiseRejectBlock pendingTokenReject;
@property (nonatomic, assign) BOOL hasListeners;
@end

@implementation NahtreekPush

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

+ (NSDictionary *)payloadFromUserInfo:(NSDictionary *)userInfo
{
  if (![userInfo isKindOfClass:NSDictionary.class]) return nil;
  NSMutableDictionary *out = [NSMutableDictionary dictionary];
  for (NSString *key in NahtreekPushPayloadKeys()) {
    id value = userInfo[key];
    if ([value isKindOfClass:NSString.class]) out[key] = value;
    else if ([value isKindOfClass:NSNumber.class]) out[key] = [value stringValue];
  }
  return out.count ? out : nil;
}

+ (void)setInitialPayloadFromResponse:(UNNotificationResponse *)response
{
  NSDictionary *payload = [self payloadFromUserInfo:response.notification.request.content.userInfo];
  if (payload) NahtreekPushInitialPayload = payload;
}

- (instancetype)init
{
  if ((self = [super init])) {
    [UNUserNotificationCenter currentNotificationCenter].delegate = self;
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(tokenRegistered:)
                                                 name:@"NahtreekPushTokenRegistered"
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(tokenFailed:)
                                                 name:@"NahtreekPushTokenFailed"
                                               object:nil];
  }
  return self;
}

- (void)dealloc
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"NahtreekPushOpened", @"NahtreekPushReceived", @"NahtreekPushTokenChanged"];
}

- (void)startObserving
{
  self.hasListeners = YES;
}

- (void)stopObserving
{
  self.hasListeners = NO;
}

- (NSDictionary *)constantsToExport
{
  return @{@"configured": @YES};
}

RCT_REMAP_METHOD(getToken,
                 getTokenWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  [center requestAuthorizationWithOptions:(UNAuthorizationOptionAlert |
                                           UNAuthorizationOptionBadge |
                                           UNAuthorizationOptionSound)
                       completionHandler:^(__unused BOOL granted, __unused NSError *error) {
    // registerForRemoteNotifications reports the real outcome; a denied user
    // still gets a token slot but no banners, matching Android behaviour where
    // the token exists independent of the POST_NOTIFICATIONS grant.
    [[NSUserDefaults standardUserDefaults] setBool:YES forKey:NahtreekPushEnabledKey];
    self.pendingTokenResolve = resolve;
    self.pendingTokenReject = reject;
    dispatch_async(dispatch_get_main_queue(), ^{
      [[UIApplication sharedApplication] registerForRemoteNotifications];
    });
  }];
}

RCT_EXPORT_METHOD(disable)
{
  [[NSUserDefaults standardUserDefaults] setBool:NO forKey:NahtreekPushEnabledKey];
  dispatch_async(dispatch_get_main_queue(), ^{
    [[UIApplication sharedApplication] unregisterForRemoteNotifications];
  });
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  [center removeAllPendingNotificationRequests];
  [center removeAllDeliveredNotifications];
}

RCT_REMAP_METHOD(getInitialNotification,
                 getInitialNotificationWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(__unused RCTPromiseRejectBlock)reject)
{
  resolve(NahtreekPushInitialPayload);
  NahtreekPushInitialPayload = nil;
}

- (void)tokenRegistered:(NSNotification *)note
{
  NSData *token = note.object;
  if (![token isKindOfClass:NSData.class] || !token.length) return;
  NSMutableString *hex = [NSMutableString stringWithCapacity:token.length * 2];
  const unsigned char *bytes = token.bytes;
  for (NSUInteger i = 0; i < token.length; i++) [hex appendFormat:@"%02x", bytes[i]];
  NSString *previous = [[NSUserDefaults standardUserDefaults] stringForKey:NahtreekPushLastTokenKey];
  [[NSUserDefaults standardUserDefaults] setObject:hex forKey:NahtreekPushLastTokenKey];
  if (self.pendingTokenResolve) {
    self.pendingTokenResolve(hex);
    self.pendingTokenResolve = nil;
    self.pendingTokenReject = nil;
  } else if (self.hasListeners && ![previous isEqualToString:hex]) {
    [self sendEventWithName:@"NahtreekPushTokenChanged" body:nil];
  }
}

- (void)tokenFailed:(NSNotification *)note
{
  NSError *error = note.object;
  if (self.pendingTokenReject) {
    self.pendingTokenReject(@"PUSH_TOKEN", @"Could not enable notifications. Please try again.",
                            [error isKindOfClass:NSError.class] ? error : nil);
    self.pendingTokenResolve = nil;
    self.pendingTokenReject = nil;
  }
}

#pragma mark - UNUserNotificationCenterDelegate

- (void)userNotificationCenter:(__unused UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
{
  BOOL enabled = [[NSUserDefaults standardUserDefaults] boolForKey:NahtreekPushEnabledKey];
  if (!enabled) {
    completionHandler(UNNotificationPresentationOptionNone);
    return;
  }
  if (self.hasListeners) [self sendEventWithName:@"NahtreekPushReceived" body:nil];
  completionHandler(UNNotificationPresentationOptionBanner |
                    UNNotificationPresentationOptionSound |
                    UNNotificationPresentationOptionBadge);
}

- (void)userNotificationCenter:(__unused UNUserNotificationCenter *)center
    didReceiveNotificationResponse:(UNNotificationResponse *)response
             withCompletionHandler:(void (^)(void))completionHandler
{
  if ([response.actionIdentifier isEqualToString:UNNotificationDismissActionIdentifier]) {
    completionHandler();
    return;
  }
  NSDictionary *payload = [[self class] payloadFromUserInfo:response.notification.request.content.userInfo];
  if (payload) {
    // Stash first so cold-start taps survive even if JS subscribes late;
    // getInitialNotification clears it after reading.
    NahtreekPushInitialPayload = payload;
    if (self.hasListeners) [self sendEventWithName:@"NahtreekPushOpened" body:payload];
  }
  completionHandler();
}

@end
