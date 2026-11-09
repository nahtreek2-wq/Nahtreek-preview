import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtPayload } from '../../common/strategies/jwt.strategy';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('conversations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT, Role.ENGINEER, Role.SERVICE_PROVIDER)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get()
  async getConversations(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.list(user.sub, { page, limit });
  }

  @Post()
  async createConversation(@CurrentUser() user: JwtPayload, @Body() dto: CreateConversationDto) {
    return this.chatService.create(user.sub, dto);
  }

  @Get(':id/messages')
  async getMessages(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.chatService.getMessages(id, user.sub);
  }

  @Post(':id/messages')
  async sendMessage(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() body: SendMessageDto) {
    const message = await this.chatService.sendMessage(id, user.sub, body);
    this.chatGateway.emitMessage(id, message);
    const participants = await this.chatService.participantUserIds(id);
    participants.forEach(userId => {
      this.chatGateway.emitUserUpdate(userId, 'conversations');
      this.chatGateway.emitUserUpdate(userId, 'notifications');
    });
    return message;
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.chatService.markRead(id, user.sub);
  }
}
