import {io, type Socket} from 'socket.io-client';
import {runtimeConfig} from '../config/runtime';

export function openChatSocket(accessToken: string): Socket | null {
  const base = runtimeConfig.apiBaseUrl?.replace(/\/api\/v1\/?$/, '');
  if (!base) {return null;}
  return io(`${base}/chat`, {
    path: '/socket.io',
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    auth: {token: accessToken},
  });
}
