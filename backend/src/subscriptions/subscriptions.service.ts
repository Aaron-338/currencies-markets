import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { Subscription, SubscriptionStatus, SubscriptionType } from './subscription.entity.js';
import { CreateSubscriptionDto } from './dto/create-subscription.dto.js';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto.js';
import { User, UserRole } from '../users/user.entity.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationType, NotificationPriority } from '../notifications/notification.entity.js';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: number, createSubscriptionDto: CreateSubscriptionDto, receiptImagePath: string): Promise<Subscription> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user already has an active subscription of this type
    const existingSubscription = await this.subscriptionsRepository.findOne({
      where: {
        userId: userId,
        type: createSubscriptionDto.type,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existingSubscription) {
      throw new BadRequestException(`User already has an active subscription for ${createSubscriptionDto.type}`);
    }

    const price = parseFloat(createSubscriptionDto.price);
    if (isNaN(price)) {
      throw new BadRequestException('Price must be a valid number.');
    }

    // Calculate expiration date (1 month from now)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const subscription = this.subscriptionsRepository.create({
      ...createSubscriptionDto,
      price: price,
      userId: userId,
      user,
      status: SubscriptionStatus.PENDING,
      expiresAt,
      receiptImagePath: receiptImagePath,
    });

    const savedSubscription = await this.subscriptionsRepository.save(subscription);

    // Send immediate notification to user that subscription was submitted
    try {
      await this.notificationsService.createForUser(
        userId,
        'Subscription Submitted',
        `Your subscription request for ${createSubscriptionDto.type} has been submitted successfully and is pending approval.`,
        NotificationType.SUBSCRIPTION_CREATED,
        {
          priority: NotificationPriority.MEDIUM,
          metadata: { 
            subscriptionId: savedSubscription.id, 
            subscriptionType: savedSubscription.type 
          },
          actionUrl: '/dashboard?tab=subscriptions',
        }
      );
    } catch (error) {
      console.error('Failed to send subscription creation notification:', error);
      // Don't throw error to prevent subscription creation from failing
    }

    return savedSubscription;
  }

  async findAll(user?: User): Promise<Subscription[]> {
    const options: any = {
      relations: ['user'],
      order: { createdAt: 'DESC' },
    };

    if (user && user.role === UserRole.ADMIN && user.verificationResponsibilities && user.verificationResponsibilities.length > 0) {
      options.where = {
        paymentMethod: In(user.verificationResponsibilities),
      };
    }
    
    return this.subscriptionsRepository.find(options);
  }

  async findAllByUser(userId: number): Promise<Subscription[]> {
    return this.subscriptionsRepository.find({
      where: { userId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByUser(userId: number): Promise<Subscription[]> {
    return this.subscriptionsRepository.find({
      where: { 
        userId: userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription;
  }

  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto, adminId?: number): Promise<Subscription> {
    const subscription = await this.findOne(id);
    
    Object.assign(subscription, updateSubscriptionDto);
    
    // If admin is verifying the subscription
    if (updateSubscriptionDto.status === SubscriptionStatus.ACTIVE && adminId) {
      subscription.verifiedBy = adminId.toString();
      subscription.verifiedAt = new Date();
    }

    return this.subscriptionsRepository.save(subscription);
  }

  async verifyPayment(id: string, adminId: number, approved: boolean, notes?: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    
    subscription.status = approved ? SubscriptionStatus.ACTIVE : SubscriptionStatus.PAYMENT_FAILED;
    subscription.verifiedBy = adminId.toString();
    subscription.verifiedAt = new Date();
    
    if (notes) {
      subscription.verificationNotes = notes;
    }

    const updatedSubscription = await this.subscriptionsRepository.save(subscription);

    // Send notification to user about verification result
    await this.notifyUser(updatedSubscription, approved, notes);

    return updatedSubscription;
  }

  async cancel(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    
    subscription.status = SubscriptionStatus.CANCELLED;
    
    return this.subscriptionsRepository.save(subscription);
  }

  async remove(id: string): Promise<void> {
    const subscription = await this.findOne(id);
    await this.subscriptionsRepository.remove(subscription);
  }

  async checkUserHasActiveSubscription(userId: number, type: SubscriptionType): Promise<boolean> {
    const subscriptions = await this.subscriptionsRepository.find({
      where: { 
        userId: userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    // If user has IVREX_PRO, they have access to all services
    const hasProSubscription = subscriptions.some(sub => sub.type === SubscriptionType.IVREX_PRO);
    
    if (hasProSubscription) {
      return true;
    }

    // Otherwise check for the specific subscription type
    return subscriptions.some(sub => sub.type === type);
  }

  async processExpiredSubscriptions(): Promise<void> {
    const now = new Date();
    
    const expiredSubscriptions = await this.subscriptionsRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        expiresAt: LessThan(now),
      },
    });

    for (const subscription of expiredSubscriptions) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await this.subscriptionsRepository.save(subscription);
    }
  }

  private async notifyUser(subscription: Subscription, approved: boolean, notes?: string): Promise<void> {
    try {
      await this.notificationsService.createSubscriptionNotification(
        subscription.userId,
        approved ? 'approved' : 'rejected',
        { 
          subscriptionId: subscription.id, 
          subscriptionType: subscription.type, 
          notes 
        }
      );
    } catch (error) {
      console.error('Failed to send subscription notification:', error);
      // Don't throw error to prevent subscription verification from failing
    }
  }
} 