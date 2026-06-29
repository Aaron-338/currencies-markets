import { Controller, Post, Req, UseGuards, Body, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Req() req, @Body() createDto: CreateSubscriptionDto) {
    const userId = parseInt(req.user.id, 10);
    if (isNaN(userId)) throw new BadRequestException('Invalid user ID');

    return this.subscriptionsService.create(userId, createDto);
  }
}
