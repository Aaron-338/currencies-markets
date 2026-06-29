import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Patch,
  Get,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SignalsService } from './signals.service';
import { CreateSignalDto } from './dto/create-signal.dto';
import { AdminGuard } from '../auth/admin.guard';
import { Signal } from './signal.entity';

@Controller('signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  create(@Body() createSignalDto: CreateSignalDto): Promise<Signal> {
    return this.signalsService.create(createSignalDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(): Promise<Signal[]> {
    return this.signalsService.findAll();
  }

  @Get('list/active')
  @UseGuards(AuthGuard('jwt'))
  getActiveSignals(): Promise<Signal[]> {
    return this.signalsService.findActiveSignals();
  }

  @Get('list/history')
  @UseGuards(AuthGuard('jwt'))
  getSignalHistory(): Promise<Signal[]> {
    return this.signalsService.findSignalHistory();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string): Promise<Signal> {
    return this.signalsService.findOne(id);
  }

  @Patch(':id/close')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  close(@Param('id') id: string): Promise<Signal> {
    return this.signalsService.closeSignal(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  remove(@Param('id') id: string): Promise<void> {
    return this.signalsService.remove(id);
  }
} 