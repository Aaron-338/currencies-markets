import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Signal, SignalStatus } from './signal.entity.js';
import { CreateSignalDto } from './dto/create-signal.dto.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationsWebSocketGateway } from '../notifications/notifications-websocket.gateway.js';
import { User } from '../users/user.entity.js';

@Injectable()
export class SignalsService {
  constructor(
    @InjectRepository(Signal)
    private signalsRepository: Repository<Signal>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private notificationsService: NotificationsService,
    @Inject(forwardRef(() => NotificationsWebSocketGateway))
    private wsGateway: NotificationsWebSocketGateway,
  ) {}

  async create(createSignalDto: CreateSignalDto): Promise<Signal> {
    const signal = this.signalsRepository.create(createSignalDto);
    const savedSignal = await this.signalsRepository.save(signal);
    
    // Notify users about new signal
    await this.notifyUsersAboutSignal(savedSignal, 'created');
    
    // Broadcast signal creation via WebSocket for real-time updates
    try {
      await this.wsGateway.notifySignalCreated(savedSignal);
    } catch (error) {
      console.error('Failed to broadcast signal creation via WebSocket:', error);
    }
    
    return savedSignal;
  }

  async findAll(): Promise<Signal[]> {
    return this.signalsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveSignals(): Promise<Signal[]> {
    return this.signalsRepository.find({
      where: { status: SignalStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async findSignalHistory(): Promise<Signal[]> {
    return this.signalsRepository.find({
      where: { status: SignalStatus.CLOSED },
      order: { closedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Signal> {
    const signal = await this.signalsRepository.findOne({ where: { id } });
    if (!signal) {
      throw new NotFoundException(`Signal with ID ${id} not found`);
    }
    return signal;
  }

  async closeSignal(id: string): Promise<Signal> {
    const signal = await this.findOne(id);
    signal.status = SignalStatus.CLOSED;
    signal.closedAt = new Date();
    
    const updatedSignal = await this.signalsRepository.save(signal);
    
    // Notify users about closed signal
    await this.notifyUsersAboutSignal(updatedSignal, 'closed');
    
    // Broadcast signal closure via WebSocket for real-time updates
    try {
      await this.wsGateway.notifySignalClosed(updatedSignal);
    } catch (error) {
      console.error('Failed to broadcast signal closure via WebSocket:', error);
    }
    
    return updatedSignal;
  }

  async remove(id: string): Promise<void> {
    const result = await this.signalsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Signal with ID ${id} not found`);
    }
  }

  private async notifyUsersAboutSignal(
    signal: Signal, 
    type: 'created' | 'closed',
  ): Promise<void> {
    try {
      // Create signal notification for all users using the new method
      await this.notificationsService.createSignalNotification({
        symbol: signal.symbol,
        action: type,
        entryPrice: signal.entry_price,
        exitPrice: undefined, // Signal entity doesn't have exit_price
      });
    } catch (error) {
      console.error(`Failed to notify users about signal ${type}:`, error);
      // Don't throw error to prevent signal creation/closure from failing
    }
  }
} 