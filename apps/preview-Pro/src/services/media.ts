import {NativeModules} from 'react-native';
import {runtimeConfig} from '../config/runtime';
import {api} from './apiClient';

export function mediaUrl(value?: string): string | undefined {
  if (!value) {return undefined;}
  if (value.startsWith('/uploads/') && runtimeConfig.apiBaseUrl) {
    return runtimeConfig.apiBaseUrl.replace(/\/api\/v1\/?$/, '') + value;
  }
  return value;
}

export async function saveProfessionalPhoto(photo: {
  uri: string;
  base64?: string;
  type?: string;
}): Promise<string> {
  if (runtimeConfig.apiBaseUrl) {
    if (!photo.base64 || !photo.type) {
      throw new Error('Choose your photo again before saving.');
    }
    const result = await api.post<{avatarUrl: string}>('/professionals/me/photo', {
      contentBase64: photo.base64,
      mimeType: photo.type,
    });
    return result.avatarUrl;
  }
  const persist = NativeModules.NahtreekRuntimeConfig?.persistProfilePhoto;
  if (!persist) {throw new Error('Photo storage is unavailable on this device.');}
  return persist(photo.uri);
}
