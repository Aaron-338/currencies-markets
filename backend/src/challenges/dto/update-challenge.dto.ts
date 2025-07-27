import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ChallengeStatus } from '../challenge.entity.js';

export class UpdateChallengeDto {
  @IsOptional()
  @IsEnum(ChallengeStatus)
  status?: ChallengeStatus;

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  @IsString()
  googleMeetLink?: string;
} 