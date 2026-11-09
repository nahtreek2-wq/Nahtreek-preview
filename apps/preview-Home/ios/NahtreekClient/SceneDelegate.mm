#import "SceneDelegate.h"
#import "AppDelegate.h"
#import "NahtreekPush.h"

@implementation SceneDelegate

- (void)scene:(UIScene *)scene
    willConnectToSession:(UISceneSession *)session
                 options:(UISceneConnectionOptions *)connectionOptions
{
  if ([scene isKindOfClass:[UIWindowScene class]] && connectionOptions.notificationResponse) {
    [NahtreekPush setInitialPayloadFromResponse:connectionOptions.notificationResponse];
  }
  if (![scene isKindOfClass:[UIWindowScene class]]) {
    return;
  }
  UIWindowScene *windowScene = (UIWindowScene *)scene;
  AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  self.window = [[UIWindow alloc] initWithWindowScene:windowScene];
  // Reuse the React Native root view controller built by RCTAppDelegate so the
  // JS bridge is created exactly once.
  self.window.rootViewController = appDelegate.window.rootViewController;
  [self.window makeKeyAndVisible];
}

@end
