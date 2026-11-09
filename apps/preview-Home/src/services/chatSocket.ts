import {io, Socket} from 'socket.io-client';
import {SOCKET_BASE} from './config';

export function openChatSocket(accessToken: string): Socket | null {
  if (!SOCKET_BASE) return null;
  return io(`${SOCKET_BASE}/chat`, {
    transports: ['websocket'],
    auth: {token: accessToken},
    reconnectionAttempts: 5,
    timeout: 8_000,
  });
}
