import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useQuery} from '@tanstack/react-query';
import {Colors, Typography, Spacing, BorderRadius} from '@nahtreek/design-system';
import {AppHeader, Avatar, Card, Icon, ICONS, MemberBadge, RatingStars, SectionHeader, VerifiedBadge} from '../components/ui';
import {EngineerCardSkeleton} from '../components/SkeletonLoader';
import {ErrorState} from '../components/ui';
import {api} from '../services/apiClient';
import type {RootStackParamList} from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type ProfileRoute = RouteProp<RootStackParamList, 'ProviderProfile'>;

export type ProviderReviewDto = {id: string; rating: number; comment: string; createdAt: string; clientName: string};
export type ProviderDetailDto = {id: string; fullName: string; avatarUrl: string | null; title: string;
  bio: string | null; baseCity: string; baseState: string; yearsOfExperience: number; serviceCategories: string[];
  averageRating: number; totalReviewsCount: number; verificationStatus: string; isMember?: boolean; reviews: ProviderReviewDto[]};

export function ProviderProfileScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<ProfileRoute>();
  const insets = useSafeAreaInsets();
  const {professionalProfileId} = route.params;
  const detail = useQuery({queryKey: ['provider-profile', professionalProfileId],
    queryFn: () => api.get<ProviderDetailDto>(`/discovery/providers/${professionalProfileId}`), retry: 1});
  const pro = detail.data;

  return <View style={[styles.root, {paddingBottom: insets.bottom}]}>
    <AppHeader title="Professional profile" subtitle={pro ? `${pro.fullName} · ${pro.title}` : undefined} onBack={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')} />
    {detail.isPending ? <EngineerCardSkeleton /> : detail.isError || !pro ? (
      <ErrorState title="Could not load this professional" message="Check your connection and try again."
        actionLabel={detail.isFetching ? 'Checking…' : 'Try again'} onAction={() => void detail.refetch()} />
    ) : (
      <ScrollView contentContainerStyle={styles.body}>
        <Card>
          <View style={styles.head}>
            <Avatar uri={pro.avatarUrl ?? undefined} name={pro.fullName} size={64} />
            <View style={styles.headCopy}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{pro.fullName}</Text>
                {pro.verificationStatus === 'VERIFIED' ? <VerifiedBadge /> : null}
                {pro.isMember ? <MemberBadge /> : null}
              </View>
              {!!pro.title && <Text style={styles.title}>{pro.title}</Text>}
              <View style={styles.metaRow}>
                <Icon name={ICONS.location} size={12} color={Colors.slate500} />
                <Text style={styles.meta}>{[pro.baseCity, pro.baseState].filter(Boolean).join(', ') || 'India'}</Text>
              </View>
            </View>
          </View>
          <View style={styles.ratingRow}>
            <RatingStars rating={pro.averageRating} />
            <Text style={styles.meta}>{pro.totalReviewsCount > 0
              ? `${pro.averageRating.toFixed(1)} · ${pro.totalReviewsCount} review${pro.totalReviewsCount === 1 ? '' : 's'}`
              : 'No reviews yet'}</Text>
          </View>
          {!!pro.bio && <Text style={styles.bio}>{pro.bio}</Text>}
        </Card>
        <SectionHeader title={`Reviews (${pro.reviews.length})`} />
        {pro.reviews.length === 0 ? (
          <Card><Text style={styles.meta}>No written reviews yet. Be the first after your completed booking.</Text></Card>
        ) : pro.reviews.map(review => (
          <Card key={review.id}>
            <View style={styles.reviewHead}>
              <Text style={styles.reviewer}>{review.clientName}</Text>
              <Text style={styles.meta}>{new Date(review.createdAt).toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}</Text>
            </View>
            <RatingStars rating={review.rating} />
            <Text style={styles.bio}>{review.comment}</Text>
          </Card>
        ))}
        <Text style={styles.hint}>Reviews come only from completed NAHTREEK bookings, so every rating here is from a real customer.</Text>
      </ScrollView>
    )}
  </View>;
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.offWhite},
  body: {padding: Spacing.md, gap: Spacing.md},
  head: {flexDirection: 'row', gap: Spacing.md, alignItems: 'center'},
  headCopy: {flex: 1, gap: 2},
  nameRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flexWrap: 'wrap'},
  name: {fontSize: 20, fontWeight: '800', color: Colors.navyDeep},
  title: {...Typography.body, color: Colors.slate600},
  metaRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  meta: {...Typography.caption, color: Colors.slate500},
  ratingRow: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm},
  bio: {...Typography.body, color: Colors.slate800, marginTop: Spacing.xs},
  reviewHead: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  reviewer: {fontSize: 15, fontWeight: '700', color: Colors.navyDeep},
  hint: {...Typography.caption, color: Colors.slate500, textAlign: 'center', paddingBottom: Spacing.lg},
});
