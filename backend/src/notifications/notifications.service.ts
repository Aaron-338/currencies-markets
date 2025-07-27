import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Notification, NotificationType, NotificationPriority } from './notification.entity.js';
import { CreateNotificationDto } from './dto/create-notification.dto.js';
import { User } from '../users/user.entity.js';

@Injectable()
export class NotificationsService {
  private wsGateway: any; // Will be injected later to avoid circular dependency

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Setter injection to avoid circular dependency
  setWebSocketGateway(gateway: any) {
    this.wsGateway = gateway;
  }

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const user = await this.usersRepository.findOne({
      where: { id: createNotificationDto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createNotificationDto.userId} not found`);
    }

    const notification = this.notificationsRepository.create({
      ...createNotificationDto,
      user,
    });

    const savedNotification = await this.notificationsRepository.save(notification);

    // Send real-time notification via WebSocket
    if (this.wsGateway) {
      try {
        await this.wsGateway.notifyUser(user.id.toString(), savedNotification);
      } catch (error) {
        console.error('Failed to send WebSocket notification:', error);
      }
    }

    return savedNotification;
  }

  async createForUser(
    userId: number,
    title: string,
    message: string,
    type: NotificationType,
    options?: {
      priority?: NotificationPriority;
      metadata?: Record<string, any>;
      actionUrl?: string;
    }
  ): Promise<Notification> {
    const createDto: CreateNotificationDto = {
      userId,
      title,
      message,
      type,
      priority: options?.priority || NotificationPriority.MEDIUM,
      metadata: options?.metadata,
      actionUrl: options?.actionUrl,
    };

    return this.create(createDto);
  }

  async createForAllUsers(
    title: string,
    message: string,
    type: NotificationType,
    options?: {
      priority?: NotificationPriority;
      metadata?: Record<string, any>;
      actionUrl?: string;
    }
  ): Promise<Notification[]> {
    const users = await this.usersRepository.find();
    const notifications: Notification[] = [];

    for (const user of users) {
      const notification = await this.createForUser(
        user.id,
        title,
        message,
        type,
        options
      );
      notifications.push(notification);
    }

    // Send real-time notification to all users via WebSocket
    if (this.wsGateway && notifications.length > 0) {
      try {
        await this.wsGateway.notifyAllUsers(notifications[0]);
      } catch (error) {
        console.error('Failed to send WebSocket notification to all users:', error);
      }
    }

    return notifications;
  }

  async createSystemAnnouncement(
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    metadata?: Record<string, any>,
    actionUrl?: string
  ): Promise<Notification[]> {
    return this.createForAllUsers(
      title,
      message,
      NotificationType.SYSTEM_ANNOUNCEMENT,
      { priority, metadata, actionUrl }
    );
  }

  async createSignalNotification(
    signalData: {
      symbol: string;
      action: 'created' | 'closed';
      entryPrice?: number;
      exitPrice?: number;
    }
  ): Promise<Notification[]> {
    const title = signalData.action === 'created' 
      ? `New Signal: ${signalData.symbol}`
      : `Signal Closed: ${signalData.symbol}`;
    
    const message = signalData.action === 'created'
      ? `A new trading signal has been created for ${signalData.symbol}${signalData.entryPrice ? ` at ${signalData.entryPrice}` : ''}`
      : `Signal for ${signalData.symbol} has been closed${signalData.exitPrice ? ` at ${signalData.exitPrice}` : ''}`;

    const type = signalData.action === 'created' 
      ? NotificationType.SIGNAL_CREATED 
      : NotificationType.SIGNAL_CLOSED;

    return this.createForAllUsers(title, message, type, {
      priority: NotificationPriority.HIGH,
      metadata: signalData,
      actionUrl: '/dashboard?tab=signals',
    });
  }

  async createSubscriptionNotification(
    userId: number,
    status: 'approved' | 'rejected',
    subscriptionData?: any
  ): Promise<Notification> {
    const title = status === 'approved' 
      ? 'Subscription Approved'
      : 'Subscription Rejected';
    
    const message = status === 'approved'
      ? 'Your subscription has been approved and is now active.'
      : 'Your subscription request has been rejected. Please contact support for more information.';

    const type = status === 'approved' 
      ? NotificationType.SUBSCRIPTION_APPROVED 
      : NotificationType.SUBSCRIPTION_REJECTED;

    return this.createForUser(userId, title, message, type, {
      priority: NotificationPriority.HIGH,
      metadata: subscriptionData,
      actionUrl: '/dashboard?tab=subscriptions',
    });
  }

  async createChallengeNotification(
    userId: number,
    status: 'approved' | 'rejected',
    challengeData?: any
  ): Promise<Notification> {
    const title = status === 'approved' 
      ? 'Challenge Approved'
      : 'Challenge Rejected';
    
    const message = status === 'approved'
      ? 'Your challenge submission has been approved.'
      : 'Your challenge submission has been rejected. Please review the requirements and try again.';

    const type = status === 'approved' 
      ? NotificationType.CHALLENGE_APPROVED 
      : NotificationType.CHALLENGE_REJECTED;

    return this.createForUser(userId, title, message, type, {
      priority: NotificationPriority.MEDIUM,
      metadata: challengeData,
      actionUrl: '/dashboard?tab=challenges',
    });
  }

  async findAll(userId: number, options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const queryOptions: FindManyOptions<Notification> = {
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    };

    if (options?.limit) {
      queryOptions.take = options.limit;
    }

    if (options?.offset) {
      queryOptions.skip = options.offset;
    }

    if (options?.unreadOnly) {
      queryOptions.where = { ...queryOptions.where, isRead: false };
    }

    const [notifications, total] = await this.notificationsRepository.findAndCount(queryOptions);

    // Get unread count separately
    const unreadCount = await this.notificationsRepository.count({
      where: { userId, isRead: false },
    });

    return {
      notifications,
      total,
      unreadCount,
    };
  }

  async markAsRead(id: string, userId: number): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    const savedNotification = await this.notificationsRepository.save(notification);

    // Send real-time notification via WebSocket
    if (this.wsGateway) {
      try {
        this.wsGateway.notifyNotificationRead(userId.toString(), id);
      } catch (error) {
        console.error('Failed to send WebSocket notification read event:', error);
      }
    }

    return savedNotification;
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true }
    );

    // Send real-time notification via WebSocket
    if (this.wsGateway) {
      try {
        this.wsGateway.notifyBulkRead(userId.toString());
      } catch (error) {
        console.error('Failed to send WebSocket bulk read event:', error);
      }
    }
  }

  async delete(id: string, userId: number): Promise<void> {
    const result = await this.notificationsRepository.delete({ id, userId });
    
    if (result.affected === 0) {
      throw new NotFoundException('Notification not found');
    }

    // Send real-time notification via WebSocket
    if (this.wsGateway) {
      try {
        this.wsGateway.notifyNotificationDeleted(userId.toString(), id);
      } catch (error) {
        console.error('Failed to send WebSocket notification deleted event:', error);
      }
    }
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationsRepository.count({
      where: { userId, isRead: false },
    });
  }
} 