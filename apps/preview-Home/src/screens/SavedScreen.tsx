import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors, Spacing} from '@nahtreek/design-system';
import {AppHeader, EmptyState, OfflineBanner} from '../components/ui';
import {ProfessionalCard} from '../components/shared/ProfessionalCard';
import {useEngineList, useFavoritesList} from '../services/queries';
import {useCity} from '../stores/city';
import type {RootStackParamList} from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SavedScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const favoritesQ = useFavoritesList();
  const city = useCity(state => state.city);
  const selectedState = useCity(state => state.state);
  const engineersQ = useEngineList(undefined, undefined, city || undefined, selectedState || undefined);
  const savedIds = new Set((favoritesQ.data ?? []).map(item => item.professionalId));
  const engineers = (engineersQ.data ?? []).filter(engineer => savedIds.has(engineer.professionalProfileId));

  return (
    <View style={styles.container}>
      <AppHeader title="Saved engineers" subtitle="Your shortlisted professionals" onBack={() => navigation.goBack()} />
      <OfflineBanner force={favoritesQ.isOffline || engineersQ.isOffline} onRetry={engineersQ.refetch} />
      <FlatList
        data={engineers}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, {paddingBottom: insets.bottom + Spacing.xl}, !engineers.length && styles.empty]}
        ListEmptyComponent={<EmptyState icon="heart-outline" title="No saved engineers yet" message="Save profiles while comparing expertise and availability." actionLabel="Discover engineers" onAction={() => navigation.navigate('EngineerDiscovery')} />}
        renderItem={({item}) => (
          <ProfessionalCard
            name={item.fullName}
            avatarUrl={item.avatarUrl}
            sub={item.specializations.join(' · ') || item.title}
            rating={item.averageRating}
            reviews={item.totalReviewsCount}
            verified={item.verificationStatus === 'VERIFIED'}
            priceLabel={item.consultationFee === undefined ? 'Fee on request' : `₹${item.consultationFee.toLocaleString('en-IN')}`}
            onPress={() => navigation.navigate('EngineerProfile', {engineerId: item.id})}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.offWhite},
  list: {padding: Spacing.lg, gap: Spacing.sm},
  empty: {flexGrow: 1, justifyContent: 'center'},
});
