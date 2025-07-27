import { IsString, IsNumber, IsEnum } from 'class-validator';
import { SignalType } from '../signal.entity.js';

export class CreateSignalDto {
  @IsString()
  symbol: string;

  @IsNumber()
  entry_price: number;

  @IsNumber()
  stop_loss: number;

  @IsNumber()
  take_profit: number;

  @IsEnum(SignalType)
  type: SignalType;
} 