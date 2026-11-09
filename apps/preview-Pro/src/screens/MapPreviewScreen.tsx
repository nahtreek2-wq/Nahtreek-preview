import {ScreenHeader} from '../components/ScreenHeader';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  NativeModules,
  Platform,
  Pressable,
  requireNativeComponent,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {RequestsStackParamList} from '../navigation/types';
import {Colors} from '@nahtreek/design-system';
import {ProColors} from '../theme/professionalTheme';

type Route = RouteProp<RequestsStackParamList, 'MapPreview'>;
const mapBridge = NativeModules.NahtreekRuntimeConfig as {
  getStaticMapUrl?: (latitude: number, longitude: number) => Promise<string>;
};
const GeoapifyMapView =
  Platform.OS === 'android'
    ? requireNativeComponent<{
        latitude: number;
        longitude: number;
        style: StyleProp<ViewStyle>;
      }>('GeoapifyMapView')
    : null;

export function MapPreviewScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RequestsStackParamList>>();
  const {params} = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const hasCoordinates =
    typeof params.latitude === 'number' &&
    typeof params.longitude === 'number' &&
    Number.isFinite(params.latitude) &&
    Number.isFinite(params.longitude) &&
    Math.abs(params.latitude) <= 90 &&
    Math.abs(params.longitude) <= 180;
  const destination = hasCoordinates
    ? `${params.latitude},${params.longitude}`
    : params.address;
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [mapError, setMapError] = useState('');
  const [mapLoading, setMapLoading] = useState(true);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    let active = true;
    setMapUrl(null);
    setMapError('');
    setMapLoading(true);
    setInteractive(false);
    if (
      !hasCoordinates ||
      Platform.OS !== 'android' ||
      !mapBridge?.getStaticMapUrl
    ) {
      setMapLoading(false);
      if (hasCoordinates && Platform.OS === 'android')
        setMapError(
          'Map view is unavailable in this build. Use directions below.',
        );
      return () => {
        active = false;
      };
    }
    mapBridge
      .getStaticMapUrl(params.latitude!, params.longitude!)
      .then(url => {
        if (active) setMapUrl(url);
      })
      .catch(error => {
        if (active) {
          setMapLoading(false);
          setMapError(
            error instanceof Error ? error.message : 'Map is unavailable.',
          );
        }
      });
    return () => {
      active = false;
    };
  }, [hasCoordinates, params.latitude, params.longitude]);

  const openDirections = () => {
    void Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        destination,
      )}`,
    ).catch(() =>
      Alert.alert(
        'Directions unavailable',
        'Please try again when you are connected.',
      ),
    );
  };

  return (
    <View style={[styles.root, {paddingBottom: insets.bottom}]}>
      <ScreenHeader
        title="Job location"
        subtitle={params.address}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.map}>
        {interactive && hasCoordinates && GeoapifyMapView ? (
          <GeoapifyMapView
            latitude={params.latitude!}
            longitude={params.longitude!}
            style={styles.mapImage}
          />
        ) : mapUrl && !mapError ? (
          <>
            <Image
              source={{uri: mapUrl}}
              style={styles.mapImage}
              resizeMode="cover"
              onLoad={() => setMapLoading(false)}
              onError={() => {
                setMapLoading(false);
                setMapError('Map image could not load. Use directions below.');
              }}
            />
            {!mapLoading ? (
              <View style={styles.pin} accessibilityLabel="Pinned location" />
            ) : null}
          </>
        ) : null}
        {mapLoading && !mapError && !interactive ? (
          <ActivityIndicator size="large" color={Colors.navyMid} />
        ) : null}
        {!interactive &&
        (mapError || !hasCoordinates || Platform.OS !== 'android') ? (
          <Text style={styles.emptyText}>
            {mapError ||
              (!hasCoordinates
                ? 'A map pin is not available for this address yet.'
                : 'In-app map is currently available on Android.')}
          </Text>
        ) : null}
      </View>
      <View style={styles.footer}>
        {hasCoordinates && GeoapifyMapView ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setInteractive(value => !value)}
            style={styles.mapMode}>
            <Text style={styles.mapModeText}>
              {interactive ? 'Show map' : 'Explore interactive map'}
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={openDirections}
          style={styles.action}>
          <Text style={styles.actionText}>Get directions ↗</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.offWhite},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: Colors.navyDeep,
  },
  back: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#1D3B57',
  },
  backText: {fontSize: 32, lineHeight: 38, color: '#FFFFFF'},
  heading: {flex: 1},
  logoFrame: {width: 36, height: 36, overflow: 'hidden', borderRadius: 9},
  logo: {width: 48, height: 48, marginLeft: -6, marginTop: -6},
  title: {fontSize: 20, lineHeight: 28, fontWeight: '700', color: '#FFFFFF'},
  address: {fontSize: 13, lineHeight: 19, color: '#D6E0E9', marginTop: 2},
  map: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  mapImage: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  pin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: Colors.navyDeep,
    backgroundColor: Colors.amber,
  },
  emptyText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.slate600,
    textAlign: 'center',
  },
  footer: {padding: 20, backgroundColor: '#FFFFFF', gap: 10},
  mapMode: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.slate200,
    backgroundColor: Colors.white,
  },
  mapModeText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '700',
    color: Colors.navyDeep,
  },
  action: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: ProColors.accent,
  },
  actionText: {fontSize: 16, fontWeight: '800', color: ProColors.onAccent},
});
