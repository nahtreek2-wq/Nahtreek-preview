import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { AccountStatus } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtPayload } from '../../common/strategies/jwt.strategy';
import { ChatService } from './chat.service';

type AuthenticatedSocket = Socket & { data: { user?: JwtPayload } };

// Mobile apps send no Origin header, so restricting browser origins in
// production never affects them. Mirrors the REST CORS policy in main.ts.
const socketOrigins = (process.env.CORS_ORIGINS ?? '').split(',').map(origin => origin.trim()).filter(Boolean);
const socketCors = process.env.NODE_ENV === 'production'
  ? { origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => callback(null, !origin || socketOrigins.includes(origin)) }
  : { origin: true };

@Injectable()
@WebSocketGateway({ namespace: '/chat', cors: socketCors })
export class ChatGateway implements OnGatewayConnection {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly chatService: ChatService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    const authorization = client.handshake.headers.authorization;
    const token = client.handshake.auth?.token ?? (typeof authorization === 'string' ? authorization.replace(/^Bearer\s+/i, '') : undefined);
    if (typeof token !== 'string') return client.disconnect(true);
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        issuer: 'nahtreek-api',
        audience: 'nahtreek-mobile',
      });
      const session = await this.prisma.session.findFirst({
        where: {
          id: payload.sid,
          userId: payload.sub,
          revokedAt: null,
          expiresAt: { gt: new Date() },
          user: { status: AccountStatus.ACTIVE },
        },
      });
      if (!session) return client.disconnect(true);
      client.data.user = payload;
      await client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('conversation:join')
  async joinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { conversationId?: string },
  ) {
    const user = client.data.user;
    if (!user || !body?.conversationId) throw new WsException('Unauthorized conversation join');
    await this.chatService.assertConversationParticipant(body.conversationId, user.sub);
    await client.join(`conversation:${body.conversationId}`);
    return {ok: true};
  }

  emitMessage(conversationId: string, message: unknown) {
    this.server.to(`conversation:${conversationId}`).emit('message:created', message);
  }

  emitUserUpdate(userId: string, resource: string) {
    this.server.to(`user:${userId}`).emit('data:changed', {resource});
  }
}
