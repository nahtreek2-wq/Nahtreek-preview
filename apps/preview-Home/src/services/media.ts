import {NativeModules} from 'react-native';
import {api} from './apiClient';
import {API_BASE, isApiConfigured} from './config';

export function mediaUrl(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith('/uploads/') && API_BASE)
    return API_BASE.replace(/\/api\/v1\/?$/, '') + value;
  return value;
}

export async function saveProfilePhoto(photo: {
  uri: string;
  base64?: string;
  type?: string;
}): Promise<string> {
  if (isApiConfigured) {
    if (!photo.base64 || !photo.type)
      throw new Error('Choose your photo again before saving.');
    const result = await api.post<{avatarUrl: string}>('/clients/me/photo', {
      contentBase64: photo.base64,
      mimeType: photo.type,
    });
    return result.avatarUrl;
  }
  const persist = NativeModules.NahtreekRuntimeConfig?.persistProfilePhoto;
  if (!persist) throw new Error('Photo storage is unavailable on this device.');
  return persist(photo.uri);
}
