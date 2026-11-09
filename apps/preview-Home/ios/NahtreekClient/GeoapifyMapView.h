#import <MapKit/MapKit.h>

@interface GeoapifyMapView : MKMapView

@property (nonatomic, assign) double latitude;
@property (nonatomic, assign) double longitude;

- (void)updateRegion;

@end
