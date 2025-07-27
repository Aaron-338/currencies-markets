import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../users/user.entity.js';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    const isSuperAdmin = user.role === UserRole.ADMIN && 
                         (!user.verificationResponsibilities || user.verificationResponsibilities.length === 0);

    if (!isSuperAdmin) {
      throw new ForbiddenException('You do not have permission to perform this action.');
    }
    
    return true;
  }
} 