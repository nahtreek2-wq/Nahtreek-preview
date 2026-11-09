import React, {useEffect, useState} from 'react';
import {
  Animated,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {useQuery} from '@tanstack/react-query';
import {
  Colors,
  Spacing,
  Typography,
} from '@nahtreek/design-system';
import {ScreenHeader} from '../components/ScreenHeader';
import {EmptyState} from '../components/EmptyState';
import {VerificationGate} from '../components/VerificationGate';
import {api} from '../services/apiClient';
import {mediaUrl} from '../services/media';
import type {MainTabParamList, MessagesStackParamList} from '../navigation/types';
import {ProColors} from '../theme/professionalTheme';
import {ScreenLoading} from '../components/ScreenLoading';
import {MotionReveal} from '../components/MotionReveal';
import {ScrollMotionBar, useScrollMotion} from '../components/ScrollMotionBar';

type Conversation = {
  id: string;
  title: string;
  subtitle: string;
  otherAvatarUrl?: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
  requestId?: string;
  requestKind?: 'engineering' | 'service';
};
type ConversationPage = {data: Conversation[]; meta: {total: number}};

function ConversationAvatar({title, url}: {title: string; url?: string}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  if (url && !failed) {
    return <Image source={{uri: mediaUrl(url)}} style={styles.avatarPhoto} onError={() => setFailed(true)} />;
  }
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{title.charAt(0).toUpperCase() || 'C'}</Text>
    </View>
  );
}

export function MessagesScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const scrollMotion = useScrollMotion();
  const navigation =
    useNavigation<NativeStackNavigationProp<MessagesStackParamList>>();
  const tabs = navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
  const conversations = useQuery({
    queryKey: ['professional-conversations'],
    queryFn: () => api.get<ConversationPage>('/conversations?limit=50'),
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
  });
  const profile = useQuery({
    queryKey: ['professional-profile'],
    queryFn: () => api.get<{profile: {verificationStatus: string} | null}>('/professionals/me'),
  });
  const verificationStatus = profile.data?.profile?.verificationStatus;
  const locked = Boolean(profile.data) && verificationStatus !== 'VERIFIED';
  const underReview = verificationStatus === 'UNDER_REVIEW' || verificationStatus === 'PENDING';
  const goVerify = () =>
    tabs?.navigate('Profile', {
      screen:
        verificationStatus === 'UNDER_REVIEW' ||
        verificationStatus === 'PENDING' ||
        verificationStatus === 'REJECTED'
          ? 'VerificationDocuments'
          : 'ProfessionalSetup',
    });
  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Chat"
        subtitle="Talk to your customers"
      />
      <ScrollMotionBar offset={scrollMotion.offset} reducedMotion={scrollMotion.reducedMotion} />
      {locked ? (
        <VerificationGate
          feature="chat"
          underReview={underReview}
          onVerify={goVerify}
          bottomPadding={tabBarHeight + 24}
        />
      ) : (
      <>
      {conversations.isPending ? (
        <ScreenLoading label="Loading client conversations…" />
      ) : null}
      {conversations.isError ? (
        <View style={styles.content}>
          <EmptyState
            icon="cloud-off-outline"
            title="Messages could not load"
            message="Check your connection and try again."
          />
          <Pressable
            onPress={() => conversations.refetch()}
            style={styles.retry}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}
      {conversations.data ? (
        <MotionReveal style={styles.listContainer}>
        <Animated.FlatList
          onScroll={scrollMotion.onScroll}
          scrollEventThrottle={16}
          data={conversations.data.data}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.list, {paddingBottom: tabBarHeight + Spacing.xxl}]}
          refreshControl={
            <RefreshControl
              refreshing={conversations.isRefetching}
              onRefresh={conversations.refetch}
              colors={[Colors.navyMid]}
            />
          }
          ListEmptyComponent={<View style={styles.emptyCard}>
            <View style={styles.emptyIcon}><MaterialCommunityIcons name="message-text-outline" size={27} color={Colors.navyMid} /></View>
            <Text style={styles.emptyTitle}>Conversations start with a job</Text>
            <Text style={styles.emptyText}>When you take a job, your chat with the customer will show here.</Text>
            <Pressable accessibilityRole="button" onPress={() => tabs?.navigate('Requests', {screen: 'RequestInbox'})} style={styles.emptyAction}>
              <Text style={styles.emptyActionText}>View my jobs</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color={ProColors.onAccent} />
            </Pressable>
          </View>}
          renderItem={({item}) => (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate('Chat', {
                  conversationId: item.id,
                  title: item.title,
                  subtitle: item.subtitle,
                  avatarUrl: item.otherAvatarUrl,
                  requestId: item.requestId,
                  requestKind: item.requestKind,
                })
              }
              style={({pressed}) => [styles.card, pressed && styles.pressed]}>
              <ConversationAvatar title={item.title} url={item.otherAvatarUrl} />
              <View style={styles.flex}>
                <View style={styles.top}>
                  <Text style={styles.name} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.time}>
                    {new Date(item.lastAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </Text>
                </View>
                <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
                <View style={styles.top}>
                  <Text style={styles.last} numberOfLines={2}>{item.lastMessage}</Text>
                  {item.unread > 0 ? (
                    <View style={styles.unread}>
                      <Text style={styles.unreadText}>{item.unread}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Pressable>
          )}
        />
        </MotionReveal>
      ) : null}
      </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.offWhite},
  listContainer: {flex: 1},
  content: {padding: 20},
  retry: {alignSelf: 'center', padding: 20},
  retryText: {...Typography.button, lineHeight: 22, color: Colors.navyMid},
  list: {padding: 20, paddingBottom: Spacing.xxl, gap: Spacing.sm, flexGrow: 1},
  emptyCard: {backgroundColor: Colors.white, borderRadius: 22, borderWidth: 1, borderColor: Colors.slate200, padding: 22, gap: 10, marginTop: Spacing.sm},
  emptyIcon: {width: 52, height: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 6},
  emptyTitle: {...Typography.h2, color: Colors.navyDeep},
  emptyText: {...Typography.body, color: Colors.slate600},
  emptyAction: {minHeight: 48, alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16, borderRadius: 12, backgroundColor: ProColors.accent, marginTop: 8},
  emptyActionText: {...Typography.button, color: ProColors.onAccent},
  card: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DCE2EA',
  },
  pressed: {opacity: 0.82},
  avatar: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: Colors.navyMid,
  },
  avatarText: {...Typography.h3, color: Colors.white},
  avatarPhoto: {width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.navyMid},
  flex: {flex: 1, minWidth: 0},
  top: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {...Typography.h3, color: Colors.slate900, flex: 1},
  time: {...Typography.badge, lineHeight: 16, color: Colors.slate500},
  subtitle: {...Typography.caption, color: Colors.navyMid, marginTop: 2},
  last: {
    ...Typography.body,
    color: Colors.slate600,
    marginTop: Spacing.xs,
    flex: 1,
  },
  unread: {
    minWidth: 24,
    minHeight: 24,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: Colors.navyDeep,
  },
  unreadText: {...Typography.badge, lineHeight: 16, color: Colors.white},
});
