import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateChallengeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Challenge description must be at least 10 characters long' })
  description: string;
} 