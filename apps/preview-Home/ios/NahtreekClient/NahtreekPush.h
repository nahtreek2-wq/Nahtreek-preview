#import <Foundation/Foundation.h>
#import <React/RCTEventEmitter.h>
#import <UserNotifications/UserNotifications.h>

@interface NahtreekPush : RCTEventEmitter <RCTBridgeModule>

// Stashes the tap payload that cold-started the app so JS can read it via
// getInitialNotification. Warm taps emit NahtreekPushOpened directly.
+ (void)setInitialPayloadFromResponse:(UNNotificationResponse *)response;

@end
