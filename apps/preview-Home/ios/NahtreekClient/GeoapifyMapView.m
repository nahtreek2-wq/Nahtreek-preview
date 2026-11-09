#import "GeoapifyMapView.h"

@implementation GeoapifyMapView

- (instancetype)init
{
  if ((self = [super init])) {
    self.rotateEnabled = NO;
    self.pitchEnabled = NO;
    self.showsUserLocation = NO;
  }
  return self;
}

- (void)setLatitude:(double)latitude
{
  _latitude = latitude;
  [self updateRegion];
}

- (void)setLongitude:(double)longitude
{
  _longitude = longitude;
  [self updateRegion];
}

- (void)updateRegion
{
  if (!isfinite(_latitude) || !isfinite(_longitude)) return;
  if (fabs(_latitude) > 90.0 || fabs(_longitude) > 180.0) return;
  CLLocationCoordinate2D center = CLLocationCoordinate2DMake(_latitude, _longitude);
  MKCoordinateRegion region = MKCoordinateRegionMakeWithDistance(center, 1200, 1200);
  dispatch_async(dispatch_get_main_queue(), ^{
    [self setRegion:region animated:NO];
    NSMutableArray<id<MKAnnotation>> *stale = [NSMutableArray array];
    for (id<MKAnnotation> annotation in self.annotations) {
      if (![annotation isKindOfClass:[MKUserLocation class]]) [stale addObject:annotation];
    }
    [self removeAnnotations:stale];
    MKPointAnnotation *pin = [[MKPointAnnotation alloc] init];
    pin.coordinate = center;
    [self addAnnotation:pin];
  });
}

@end
