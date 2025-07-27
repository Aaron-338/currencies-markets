import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service.js';
import { CreateNotificationDto } from './dto/create-notification.dto.js';
import { AdminGuard } from '../auth/admin.guard.js';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @Req() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const userId = parseInt(req.user.id, 10);
    const options = {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      unreadOnly: unreadOnly === 'true',
    };

    return this.notificationsService.findAll(userId, options);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req) {
    const userId = parseInt(req.user.id, 10);
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req) {
    const userId = parseInt(req.user.id, 10);
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('mark-all-read')
  async markAllAsRead(@Req() req) {
    const userId = parseInt(req.user.id, 10);
    await this.notificationsService.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req) {
    const userId = parseInt(req.user.id, 10);
    await this.notificationsService.delete(id, userId);
    return { message: 'Notification deleted' };
  }

  // Admin-only endpoint for creating system announcements
  @Post('system-announcement')
  @UseGuards(AdminGuard)
  async createSystemAnnouncement(
    @Body() body: {
      title: string;
      message: string;
      priority?: string;
      actionUrl?: string;
    }
  ) {
    await this.notificationsService.createSystemAnnouncement(
      body.title,
      body.message,
      body.priority as any,
      undefined,
      body.actionUrl,
    );
    return { message: 'System announcement sent to all users' };
  }

  // Admin-only endpoint for creating notifications
  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }
} 