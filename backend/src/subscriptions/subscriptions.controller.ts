import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from './subscriptions.service.js';
import { CreateSubscriptionDto } from './dto/create-subscription.dto.js';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto.js';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as crypto from 'crypto';
import { AdminGuard } from '../auth/admin.guard.js';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('receipt', {
      storage: diskStorage({
        destination: './uploads/receipts',
        filename: (req, file, cb) => {
          const randomName = crypto.randomBytes(16).toString('hex');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async create(
    @Req() req,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Receipt image is required');
    }
    const userId = parseInt(req.user.id, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID.');
    }
    
    // Normalize path to use forward slashes for URL compatibility
    const normalizedPath = file.path.replace(/\\/g, '/');
    
    return this.subscriptionsService.create(userId, createSubscriptionDto, normalizedPath);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Req() req) {
    const user = req.user;
    if (user.role === 'admin') {
      return this.subscriptionsService.findAll(user);
    }
    
    return this.subscriptionsService.findAllByUser(user.id);
  }

  @Get('active')
  @UseGuards(AuthGuard('jwt'))
  findActive(@Req() req) {
    return this.subscriptionsService.findActiveByUser(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string, @Req() req) {
    const subscription = await this.subscriptionsService.findOne(id);
    
    if (req.user.role !== 'admin' && subscription.userId !== req.user.id) {
      throw new BadRequestException('You can only view your own subscriptions');
    }
    
    return subscription;
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Req() req,
  ) {
    const subscription = await this.subscriptionsService.findOne(id);
    
    if (req.user.role === 'admin') {
      return this.subscriptionsService.update(id, updateSubscriptionDto, req.user.id);
    }
    
    if (subscription.userId !== req.user.id) {
      throw new BadRequestException('You can only update your own subscriptions');
    }
    
    if (updateSubscriptionDto.status) {
      throw new BadRequestException('Only admins can change subscription status');
    }
    
    return this.subscriptionsService.update(id, updateSubscriptionDto);
  }

  @Post(':id/verify')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async verifyPayment(
    @Param('id') id: string,
    @Body() verifyData: { approved: boolean; notes?: string },
    @Req() req,
  ) {
    return this.subscriptionsService.verifyPayment(
      id,
      req.user.id,
      verifyData.approved,
      verifyData.notes,
    );
  }

  @Post(':id/cancel')
  @UseGuards(AuthGuard('jwt'))
  async cancelSubscription(@Param('id') id: string, @Req() req) {
    const subscription = await this.subscriptionsService.findOne(id);
    
    if (req.user.role !== 'admin' && subscription.userId !== req.user.id) {
      throw new BadRequestException('You can only cancel your own subscriptions');
    }
    
    return this.subscriptionsService.cancel(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }
} 