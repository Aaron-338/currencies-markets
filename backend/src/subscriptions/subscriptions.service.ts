// src/subscriptions/subscriptions.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus, SubscriptionType } from './subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { User } from '../users/user.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new subscription for a user
   */
  async create(userId: number, dto: CreateSubscriptionDto): Promise<Subscription> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Ensure type is a valid enum value
    if (!Object.values(SubscriptionType).includes(dto.type as SubscriptionType)) {
      throw new Error('Invalid subscription type');
    }

    const subscription = this.subscriptionRepository.create({
      serviceName: dto.serviceName,
      type: dto.type as SubscriptionType,
      price: dto.price,
      paymentMethod: dto.paymentMethod,
      paymentPhoneNumber: dto.paymentPhoneNumber,
      fullName: dto.fullName,
      email: dto.email,
      status: SubscriptionStatus.ACTIVE,
      user,
    });

    return await this.subscriptionRepository.save(subscription);
  }

  /**
   * Find all subscriptions (admin)
   */
  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find one subscription by ID
   */
  async findOne(id: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!subscription) throw new NotFoundException(`Subscription with ID ${id} not found`);
    return subscription;
  }

  /**
   * Cancel subscription (soft delete / status update)
   */
  async cancel(id: number): Promise<Subscription> {
    const subscription = await this.findOne(id);
    subscription.status = SubscriptionStatus.CANCELLED;
    return this.subscriptionRepository.save(subscription);
  }

  /**
   * Find active subscriptions for a user
   */
  async findActiveByUser(userId: number): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: {
        user: { id: userId },
        status: SubscriptionStatus.ACTIVE,
      },
      relations: ['user'],
    });
  }
}
