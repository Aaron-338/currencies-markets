import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ReviewChallengeDto {
  @IsBoolean()
  approved: boolean;

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  @IsString()
  googleMeetLink?: string;
} 