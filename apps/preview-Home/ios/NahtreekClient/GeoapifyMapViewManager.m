#import <React/RCTViewManager.h>

#import "GeoapifyMapView.h"

@interface GeoapifyMapViewManager : RCTViewManager
@end

@implementation GeoapifyMapViewManager

RCT_EXPORT_MODULE(GeoapifyMapView)

- (UIView *)view
{
  return [[GeoapifyMapView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(latitude, double)
RCT_EXPORT_VIEW_PROPERTY(longitude, double)

@end
