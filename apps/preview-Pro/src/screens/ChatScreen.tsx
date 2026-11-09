import {ScreenHeader} from '../components/ScreenHeader';
import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  AppState,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {KeyboardAwareView} from '../../../../packages/mobile-ui/KeyboardAwareView';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '@nahtreek/design-system';
import type {MainTabParamList, MessagesStackParamList} from '../navigation/types';
import {api} from '../services/apiClient';
import {openChatSocket} from '../services/chatSocket';
import {ScrollMotionBar, useScrollMotion} from '../components/ScrollMotionBar';
import {useSessionStore} from '../stores/session';
import {useProToast} from '../stores/proToast';
import {EmptyState} from '../components/EmptyState';

type Props = NativeStackScreenProps<MessagesStackParamList, 'Chat'>;
type Message = {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderName: string;
  content: string;
  createdAt: string;
};

export function ChatScreen() {
  const scrollMotion = useScrollMotion();
  const insets = useSafeAreaInsets();
  const route = useRoute<Props['route']>();
  const navigation =
    useNavigation<NativeStackNavigationProp<MessagesStackParamList>>();
  const queryClient = useQueryClient();
  const toast = useProToast();
  const currentUser = useSessionStore(state => state.user);
  const accessToken = useSessionStore(state => state.accessToken);
  const {conversationId, title, subtitle, avatarUrl, requestId, requestKind} = route.params;
  const [draft, setDraft] = useState('');
  const sending = useRef(false);
  const messages = useQuery({
    queryKey: ['professional-messages', conversationId],
    queryFn: () =>
      api.get<Message[]>(`/conversations/${conversationId}/messages`),
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  });
  const send = useMutation({
    mutationFn: (content: string) =>
      api.post<Message>(`/conversations/${conversationId}/messages`, {content}),
    onSuccess: message => {
      queryClient.setQueryData<Message[]>(
        ['professional-messages', conversationId],
        (previous: Message[] | undefined) =>
          [
            ...(previous ?? []).filter((item: Message) => item.id !== message.id),
            message,
          ].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      );
      queryClient
        .invalidateQueries({queryKey: ['professional-conversations']})
        .catch(() => undefined);
    },
    onError: error => {
      toast(error instanceof Error ? error.message : 'Message failed to send.', 'error');
    },
    onSettled: () => {
      sending.current = false;
    },
  });

  useEffect(() => {
    api
      .patch(`/conversations/${conversationId}/read`)
      .then(() =>
        queryClient.invalidateQueries({
          queryKey: ['professional-conversations'],
        }),
      )
      .catch(() => undefined);
  }, [conversationId, queryClient]);
  useEffect(() => {
    if (!accessToken) {
      return;
    }
    const socket = openChatSocket(accessToken);
    if (!socket) {
      return;
    }
    const refresh = () => {
      socket.emit('conversation:join', {conversationId});
      queryClient
        .invalidateQueries({
          queryKey: ['professional-messages', conversationId],
        })
        .catch(() => undefined);
    };
    const receive = (message: Message) => {
      if (message.conversationId !== conversationId) {
        return;
      }
      queryClient.setQueryData<Message[]>(
        ['professional-messages', conversationId],
        (previous: Message[] | undefined) =>
          [
            ...(previous ?? []).filter((item: Message) => item.id !== message.id),
            message,
          ].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      );
      queryClient
        .invalidateQueries({queryKey: ['professional-conversations']})
        .catch(() => undefined);
    };
    socket.on('connect', refresh);
    socket.on('message:created', receive);
    const appState = AppState.addEventListener('change', state =>
      state === 'active' ? socket.connect() : socket.disconnect(),
    );
    return () => {
      appState.remove();
      socket.off('connect', refresh);
      socket.off('message:created', receive);
      socket.disconnect();
    };
  }, [accessToken, conversationId, queryClient]);

  const submit = () => {
    const content = draft.trim();
    if (!content || sending.current) {
      return;
    }
    sending.current = true;
    send.mutate(content, {
      onSuccess: () =>
        setDraft(current => (current.trim() === content ? '' : current)),
    });
  };
  const data = [...(messages.data ?? [])].reverse();
  return (
    <View style={styles.root}>
      <ScreenHeader
        title={title}
        subtitle={subtitle}
        avatarUrl={avatarUrl}
        onBack={() => navigation.goBack()}
      />
      {requestId && requestKind ? <Pressable accessibilityRole="button" accessibilityLabel={`View related ${requestKind === 'service' ? 'service job' : 'engineering request'}`} onPress={() => navigation.getParent<BottomTabNavigationProp<MainTabParamList>>()?.navigate('Requests', {screen: 'RequestDetail', params: {id: requestId, kind: requestKind}})} style={styles.jobContext}>
        <MaterialCommunityIcons name={requestKind === 'service' ? 'toolbox-outline' : 'ruler-square-compass'} size={20} color={Colors.navyMid} />
        <Text style={styles.jobContextText} numberOfLines={1}>{subtitle || 'Related job'}</Text>
        <Text style={styles.jobContextAction}>View job  →</Text>
      </Pressable> : null}
      <ScrollMotionBar offset={scrollMotion.offset} reducedMotion={scrollMotion.reducedMotion} />
      <KeyboardAwareView style={styles.flex}>
        {messages.isPending ? (
          <EmptyState
            icon="message-processing-outline"
            title="Loading conversation"
            message="Getting your messages…"
          />
        ) : messages.isError ? (
          <View style={styles.errorWrap}>
            <EmptyState
              icon="cloud-off-outline"
              title="Conversation could not load"
              message="Check your connection and try again."
            />
            <Pressable onPress={() => messages.refetch()} style={styles.retry}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : data.length ? (
          <Animated.FlatList
            inverted
            onScroll={scrollMotion.onScroll}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            data={data}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            renderItem={({item}) => {
              const mine = item.senderUserId === currentUser?.id;
              return (
                <View
                  style={[styles.bubbleWrap, mine && styles.bubbleWrapMine]}>
                  <View style={[styles.bubble, mine && styles.bubbleMine]}>
                    {!mine ? (
                      <Text style={styles.sender}>{item.senderName}</Text>
                    ) : null}
                    <Text style={[styles.message, mine && styles.messageMine]}>
                      {item.content}
                    </Text>
                    <Text style={[styles.time, mine && styles.timeMine]}>
                      {new Date(item.createdAt).toLocaleTimeString('en-IN', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        ) : (
          <View style={styles.empty}>
            <EmptyState
              icon="message-outline"
              title="No messages yet"
              message="Send a clear message about this request."
            />
          </View>
        )}
        {send.error ? (
          <Text accessibilityRole="alert" style={styles.sendError}>
            Message not sent. Your text is still here—tap send to retry.
          </Text>
        ) : null}
        <View
          style={[
            styles.composer,
            {paddingBottom: Math.max(insets.bottom, 20)},
          ]}>
          <TextInput
            accessibilityLabel="Message"
            value={draft}
            onChangeText={setDraft}
            multiline
            placeholder="Write a message"
            placeholderTextColor={Colors.slate500}
            style={styles.input}
          />
          <Pressable
            accessibilityLabel={
              send.isPending ? 'Sending message' : 'Send message'
            }
            disabled={!draft.trim() || send.isPending}
            onPress={submit}
            style={[
              styles.send,
              (!draft.trim() || send.isPending) && styles.sendDisabled,
            ]}>
            <MaterialCommunityIcons
              name="send"
              size={18}
              color={Colors.white}
            />
          </Pressable>
        </View>
      </KeyboardAwareView>
    </View>
  );
}

const styles = StyleSheet.create({
  jobContext: {minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.slate200, backgroundColor: Colors.white},
  jobContextText: {...Typography.caption, color: Colors.slate800, flex: 1},
  jobContextAction: {...Typography.caption, fontWeight: '700', color: Colors.navyMid},
  root: {flex: 1, backgroundColor: Colors.offWhite},
  flex: {flex: 1, minWidth: 0},
  header: {
    minHeight: 92,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.navyDeep,
  },
  back: {width: 48, height: 48, alignItems: 'center', justifyContent: 'center'},
  headerTitle: {...Typography.h3, color: Colors.white},
  headerSubtitle: {...Typography.caption, color: Colors.slate300},
  list: {padding: 20},
  bubbleWrap: {alignItems: 'flex-start', marginBottom: Spacing.sm},
  bubbleWrapMine: {alignItems: 'flex-end'},
  bubble: {
    maxWidth: '90%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.slate200,
    borderRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.xs,
  },
  bubbleMine: {
    backgroundColor: Colors.navyDeep,
    borderColor: Colors.navyDeep,
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.xs,
  },
  sender: {
    ...Typography.badge,
    lineHeight: 16,
    color: Colors.navyMid,
    marginBottom: 2,
  },
  message: {...Typography.body, color: Colors.slate800},
  messageMine: {color: Colors.white},
  time: {
    ...Typography.badge,
    lineHeight: 16,
    color: Colors.slate500,
    textAlign: 'right',
    marginTop: 3,
  },
  timeMine: {color: Colors.slate300},
  empty: {flex: 1, justifyContent: 'center', padding: 20},
  errorWrap: {flex: 1, justifyContent: 'center', padding: 20},
  retry: {alignSelf: 'center', padding: 20},
  retryText: {...Typography.button, lineHeight: 22, color: Colors.navyMid},
  sendError: {
    ...Typography.caption,
    color: Colors.error,
    paddingHorizontal: 20,
    paddingBottom: Spacing.xs,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.slate200,
  },
  input: {
    ...Typography.body,
    flex: 1,
    maxHeight: 112,
    minHeight: 48,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.slate900,
    backgroundColor: Colors.offWhite,
    borderWidth: 1,
    borderColor: Colors.slate200,
    borderRadius: BorderRadius.lg,
  },
  send: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: Colors.navyDeep,
  },
  sendDisabled: {opacity: 0.45},
});
