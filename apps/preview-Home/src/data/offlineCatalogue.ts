import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ClientProfileDto,
  ConversationDto,
  EngineerProfileDto,
  EngineerRequestDto,
  FavoriteDto,
  MessageDto,
  NotificationDto,
} from '@nahtreek/types';
import {EngineerRequestStatus} from '@nahtreek/types';
import {useSessionStore} from '../stores/session';
import {stateForCity} from '../services/geography';
import {readOfflineProfile, writeOfflineProfile} from '../services/offlineProfileStorage';

const STORAGE_PREFIX = '@nahtreek/offline-catalogue/v1';
const keyFor = (name: string) => `${STORAGE_PREFIX}/${name}`;
const listKeyFor = (name: string) => name === 'engineers'
  ? keyFor(name)
  : keyFor(`accounts/${encodeURIComponent(useSessionStore.getState().user?.id ?? 'guest')}/${name}`);

// Remove only the legacy fixture IDs written by older builds. Real device-local
// drafts/history remain intact when upgrading the app.
const LEGACY_FIXTURE_IDS = new Set([
  'req-1', 'req-2', 'conv-1', 'm-1', 'm-2', 'm-3', 'n-1', 'n-2', 'n-3',
]);

async function readList<T>(name: string): Promise<T[]> {
  const storageKey = listKeyFor(name);
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        const userRecords = data.filter(
          item => !item || typeof item !== 'object' || !('id' in item) ||
            !LEGACY_FIXTURE_IDS.has(String((item as {id: unknown}).id)),
        ) as T[];
        if (userRecords.length !== data.length)
          await AsyncStorage.setItem(storageKey, JSON.stringify(userRecords));
        return userRecords;
      }
    }
    await AsyncStorage.setItem(storageKey, '[]');
    return [];
  } catch {
    return [];
  }
}

async function writeList<T>(name: string, data: T[], epoch: number): Promise<T[]> {
  if (useSessionStore.getState().sessionEpoch !== epoch) throw new Error('Your account changed. Please try again.');
  const storageKey = listKeyFor(name);
  await AsyncStorage.setItem(storageKey, JSON.stringify(data));
  return data;
}

export async function getOfflineEngineers(city?: string): Promise<EngineerProfileDto[]> {
  const engineers: EngineerProfileDto[] = [];
  const selectedCity = city?.split(',')[0]?.trim().toLocaleLowerCase();
  return selectedCity
    ? engineers.filter(engineer => engineer.baseCity.toLocaleLowerCase() === selectedCity)
    : engineers;
}
export const getOfflineRequests = () => readList<EngineerRequestDto>('requests');
export const getOfflineFavorites = () => readList<FavoriteDto>('favorites');
export const getOfflineConversations = () => readList<ConversationDto>('conversations');
export const getOfflineNotifications = () => readList<NotificationDto>('notifications');

export async function getOfflineEngineer(id: string): Promise<EngineerProfileDto | undefined> {
  return (await getOfflineEngineers()).find(engineer => engineer.id === id);
}

export async function createOfflineRequest(input: Partial<EngineerRequestDto>): Promise<EngineerRequestDto> {
  const epoch = useSessionStore.getState().sessionEpoch;
  const engineer = input.engineerProfileId ? await getOfflineEngineer(input.engineerProfileId) : undefined;
  if (!engineer || !input.projectTitle || !input.projectDescription || !input.propertyType || !input.locationAddress) {
    throw new Error('Complete the request details before saving it offline.');
  }
  const request: EngineerRequestDto = {
    id: `offline-request-${Date.now()}`,
    clientProfileId: input.clientProfileId ?? 'offline-client',
    engineerProfileId: engineer.id,
    engineerName: engineer.fullName,
    projectTitle: input.projectTitle,
    projectDescription: input.projectDescription,
    propertyType: input.propertyType,
    projectSizeSqFt: input.projectSizeSqFt,
    locationAddress: input.locationAddress,
    latitude: input.latitude ?? engineer.baseLatitude,
    longitude: input.longitude ?? engineer.baseLongitude,
    status: EngineerRequestStatus.PENDING,
    createdAt: new Date().toISOString(),
  };
  const requests = await getOfflineRequests();
  await writeList('requests', [request, ...requests], epoch);
  return request;
}

export async function cancelOfflineRequest(id: string): Promise<EngineerRequestDto> {
  const epoch = useSessionStore.getState().sessionEpoch;
  const requests = await getOfflineRequests();
  const index = requests.findIndex(request => request.id === id);
  if (index < 0) throw new Error('This saved request could not be found.');
  const request = {...requests[index], status: EngineerRequestStatus.CANCELLED};
  requests[index] = request;
  await writeList('requests', requests, epoch);
  return request;
}

export async function setOfflineFavorite(professionalId: string, isAdding: boolean): Promise<FavoriteDto[]> {
  const epoch = useSessionStore.getState().sessionEpoch;
  const favorites = await getOfflineFavorites();
  const next = isAdding
    ? favorites.some(item => item.professionalId === professionalId)
      ? favorites
      : [...favorites, {professionalId, createdAt: new Date().toISOString()}]
    : favorites.filter(item => item.professionalId !== professionalId);
  return writeList('favorites', next, epoch);
}

export async function getOfflineMessages(conversationId: string): Promise<MessageDto[]> {
  return readList<MessageDto>(`messages/${conversationId}`);
}

export async function addOfflineMessage(input: Omit<MessageDto, 'id' | 'createdAt'>): Promise<MessageDto> {
  const epoch = useSessionStore.getState().sessionEpoch;
  const messages = await getOfflineMessages(input.conversationId);
  const message: MessageDto = {...input, id: `offline-message-${Date.now()}`, createdAt: new Date().toISOString()};
  await writeList(`messages/${input.conversationId}`, [...messages, message], epoch);
  const conversations = await getOfflineConversations();
  const index = conversations.findIndex(item => item.id === input.conversationId);
  if (index >= 0) {
    conversations[index] = {...conversations[index], lastMessage: input.content, lastAt: 'Just now'};
    await writeList('conversations', conversations, epoch);
  }
  return message;
}

export async function createOfflineConversation(engineerRequestId: string): Promise<ConversationDto> {
  const epoch = useSessionStore.getState().sessionEpoch;
  const conversations = await getOfflineConversations();
  const existing = conversations.find(item => item.engineerRequestId === engineerRequestId);
  if (existing) return existing;
  const request = (await getOfflineRequests()).find(item => item.id === engineerRequestId);
  if (!request) throw new Error('The saved request could not be found.');
  const conversation: ConversationDto = {
    id: `offline-conversation-${Date.now()}`,
    engineerRequestId,
    title: request.engineerName,
    subtitle: `Re: ${request.projectTitle}`,
    professionalName: request.engineerName,
    lastMessage: 'Local conversation created. Messages stay on this device until you reconnect.',
    lastAt: 'Just now',
    unread: 0,
  };
  await writeList('conversations', [conversation, ...conversations], epoch);
  return conversation;
}

export async function markOfflineConversationRead(conversationId: string): Promise<void> {
  const epoch = useSessionStore.getState().sessionEpoch;
  const conversations = await getOfflineConversations();
  const next = conversations.map(item => item.id === conversationId ? {...item, unread: 0} : item);
  await writeList('conversations', next, epoch);
}

export async function markAllOfflineNotificationsRead(): Promise<void> {
  const epoch = useSessionStore.getState().sessionEpoch;
  const notifications = await getOfflineNotifications();
  await writeList('notifications', notifications.map(item => ({...item, isRead: true})), epoch);
}

export async function markOfflineNotificationRead(id: string): Promise<void> {
  const epoch = useSessionStore.getState().sessionEpoch;
  const notifications = await getOfflineNotifications();
  await writeList('notifications', notifications.map(item => item.id === id ? {...item, isRead: true} : item), epoch);
}

export async function postOfflineReview(input: {requestId: string; rating: number; comment: string; reviewerName: string}): Promise<void> {
  const epoch = useSessionStore.getState().sessionEpoch;
  const request = (await getOfflineRequests()).find(item => item.id === input.requestId);
  if (!request) throw new Error('The saved request could not be found.');
  const engineers = await getOfflineEngineers();
  const index = engineers.findIndex(item => item.id === request.engineerProfileId);
  if (index < 0) throw new Error('The saved engineer profile could not be found.');
  const engineer = engineers[index];
  const reviews = [...(engineer.reviews ?? []), {
    name: input.reviewerName,
    rating: input.rating,
    comment: input.comment,
    date: new Intl.DateTimeFormat('en-IN', {month: 'short', year: 'numeric'}).format(new Date()),
  }];
  engineers[index] = {
    ...engineer,
    reviews,
    totalReviewsCount: engineer.totalReviewsCount + 1,
    averageRating: Number(((engineer.averageRating * engineer.totalReviewsCount + input.rating) / (engineer.totalReviewsCount + 1)).toFixed(1)),
  };
  await writeList('engineers', engineers, epoch);
}

type OfflineUser = {
  id: string;
  fullName: string;
  avatarUrl?: string;
  email?: string;
  address?: string;
  homeCity?: string;
  state?: string;
  postalCode?: string;
} | null;

export async function getOfflineClientProfile(user: OfflineUser): Promise<ClientProfileDto> {
  const userId = user?.id ?? 'offline-client';
  const fallback: ClientProfileDto = {
    id: `profile-${userId}`,
    userId,
    fullName: user?.fullName ?? 'Nahtreek Client',
    avatarUrl: user?.avatarUrl,
    email: user?.email,
    address: user?.address,
    postalCode: user?.postalCode,
    city: user?.homeCity,
    state: user?.state ?? (user?.homeCity ? stateForCity(user.homeCity) : undefined),
  };
  try {
    const raw = await readOfflineProfile(userId);
    return raw ? JSON.parse(raw) as ClientProfileDto : fallback;
  } catch {
    return fallback;
  }
}

export async function updateOfflineClientProfile(user: OfflineUser, patch: Partial<ClientProfileDto>): Promise<ClientProfileDto> {
  const profile = await getOfflineClientProfile(user);
  const next = {...profile, ...patch};
  await writeOfflineProfile(profile.userId, JSON.stringify(next));
  if (user?.id) {
    const activityKey = keyFor(`accounts/${encodeURIComponent(user.id)}/activity`);
    const raw = await AsyncStorage.getItem(activityKey);
    let history: unknown[] = [];
    try { const parsed = raw ? JSON.parse(raw) : []; if (Array.isArray(parsed)) history = parsed; } catch { /* Reset corrupt local history. */ }
    await AsyncStorage.setItem(activityKey, JSON.stringify([{id: `profile-${Date.now()}`, action: 'PROFILE_UPDATED', entity: 'ClientProfile', entityId: profile.id, createdAt: new Date().toISOString()}, ...history].slice(0, 500)));
  }
  return next;
}

export async function getOfflineActivity(): Promise<{id: string; action: string; entity: string; entityId: string; createdAt: string}[]> {
  return readList('activity');
}
