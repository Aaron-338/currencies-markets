import { IsEnum, IsOptional, IsArray, IsString } from 'class-validator';
import { UserRole } from '../user.entity.js';

export class UpdatePermissionsDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  verificationResponsibilities?: string[];
} 