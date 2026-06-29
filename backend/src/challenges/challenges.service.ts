import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge, ChallengeStatus } from './challenge.entity.js';
import { CreateChallengeDto } from './dto/create-challenge.dto.js';
import { UpdateChallengeDto } from './dto/update-challenge.dto.js';
import { ReviewChallengeDto } from './dto/review-challenge.dto.js';
import { User, UserRole } from '../users/user.entity.js';
import { Subscription, SubscriptionStatus } from '../subscriptions/subscription.entity.js';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Challenge)
    private challengesRepository: Repository<Challenge>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: number, createChallengeDto: CreateChallengeDto, screenshotPath?: string): Promise<Challenge> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user already has a pending or approved challenge
    const existingChallenge = await this.challengesRepository.findOne({
      where: [
        { userId: userId, status: ChallengeStatus.SUBMITTED },
        { userId: userId, status: ChallengeStatus.UNDER_REVIEW },
        { userId: userId, status: ChallengeStatus.APPROVED },
      ],
    });

    if (existingChallenge) {
      throw new BadRequestException('You already have an active challenge submission');
    }

    const challenge = this.challengesRepository.create({
      ...createChallengeDto,
      userId: userId,
      user,
      screenshotPath: screenshotPath || null,
      status: ChallengeStatus.SUBMITTED,
    });

    return this.challengesRepository.save(challenge);
  }

  async findAll(): Promise<Challenge[]> {
    return this.challengesRepository.find({
      relations: ['user', 'subscription'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByUser(userId: number): Promise<Challenge[]> {
    return this.challengesRepository.find({
      where: { userId: userId },
      relations: ['subscription'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingChallenges(): Promise<Challenge[]> {
    return this.challengesRepository.find({
      where: [
        { status: ChallengeStatus.SUBMITTED },
        { status: ChallengeStatus.UNDER_REVIEW },
      ],
      relations: ['user', 'subscription'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Challenge> {
    const challenge = await this.challengesRepository.findOne({
      where: { id },
      relations: ['user', 'subscription'],
    });

    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }

    return challenge;
  }

  async linkSubscription(challengeId: string, subscriptionId: string): Promise<Challenge> {
    const challenge = await this.findOne(challengeId);
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id: Number(subscriptionId) },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${subscriptionId} not found`);
    }

    challenge.subscription = subscription;
    challenge.subscriptionId = subscriptionId;
    
    return this.challengesRepository.save(challenge);
  }

  async review(id: string, adminId: number, reviewData: ReviewChallengeDto): Promise<Challenge> {
    const challenge = await this.findOne(id);
    
    challenge.status = reviewData.approved ? ChallengeStatus.APPROVED : ChallengeStatus.REJECTED;
    challenge.reviewedBy = adminId.toString();
    challenge.reviewedAt = new Date();
    
    if (reviewData.adminNotes) {
      challenge.adminNotes = reviewData.adminNotes;
    }

    if (reviewData.approved && reviewData.googleMeetLink) {
      challenge.googleMeetLink = reviewData.googleMeetLink;
    }

    const updatedChallenge = await this.challengesRepository.save(challenge);

    // If rejected, also update the associated subscription status
    if (!reviewData.approved && challenge.subscription) {
      await this.subscriptionsRepository.update(
        challenge.subscription.id,
        { status: SubscriptionStatus.PAYMENT_FAILED }
      );
    }

    // Send notification to user about challenge review result
    try {
      await this.notificationsService.createChallengeNotification(
        challenge.userId,
        reviewData.approved ? 'approved' : 'rejected',
        {
          challengeId: challenge.id,
          adminNotes: reviewData.adminNotes,
          googleMeetLink: reviewData.googleMeetLink
        }
      );
    } catch (error) {
      console.error('Failed to send challenge notification:', error);
      // Don't throw error to prevent challenge review from failing
    }

    return updatedChallenge;
  }

  async update(id: string, updateChallengeDto: UpdateChallengeDto): Promise<Challenge> {
    const challenge = await this.findOne(id);
    
    Object.assign(challenge, updateChallengeDto);
    
    return this.challengesRepository.save(challenge);
  }

  async checkUserAccess(userId: number): Promise<boolean> {
    // Check if user has an approved challenge
    const approvedChallenge = await this.challengesRepository.findOne({
      where: {
        userId: userId,
        status: ChallengeStatus.APPROVED,
      },
      relations: ['subscription'],
    });

    if (!approvedChallenge) {
      return false;
    }
    return false;
  }

  async restrictUserAccess(userId: number): Promise<void> {
    // Find all approved challenges for the user
    const approvedChallenges = await this.challengesRepository.find({
      where: {
        userId: userId,
        status: ChallengeStatus.APPROVED,
      },
    });

    // Mark them as rejected (restrict access)
    for (const challenge of approvedChallenges) {
      challenge.status = ChallengeStatus.REJECTED;
      challenge.adminNotes = 'Access restricted due to subscription rejection';
      await this.challengesRepository.save(challenge);
    }
  }

  async remove(id: string): Promise<void> {
    const challenge = await this.findOne(id);
    await this.challengesRepository.remove(challenge);
  }
} 