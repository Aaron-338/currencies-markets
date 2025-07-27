import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service.js';
import { SessionService } from './session.service.js';
import { UsersService } from '../users/users.service.js';
import { AccessTokenPayload } from './token.service.js';

@Injectable()
export class TokenValidationService {
  constructor(
    private tokenService: TokenService,
    private sessionService: SessionService,
    private usersService: UsersService,
  ) {}

  /**
   * Validate access token against session store
   * @param token - The access token to validate
   * @returns Validated user and session info
   * @throws UnauthorizedException if token is invalid
   */
  async validateAccessToken(token: string): Promise<{
    user: any;
    sessionId: string;
    payload: AccessTokenPayload;
  }> {
    // 1. Verify JWT token
    const payload = this.tokenService.verifyAccessToken(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid access token');
    }

    // 2. Check if token is expired
    if (this.tokenService.isTokenExpired(payload)) {
      throw new UnauthorizedException('Access token expired');
    }

    // 3. Validate session exists and is valid
    const isSessionValid = await this.sessionService.validateSession(payload.sessionId);
    if (!isSessionValid) {
      throw new UnauthorizedException('Invalid session');
    }

    // 4. Check if user still exists and is active
    const user = await this.usersService.findOne(payload.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      user,
      sessionId: payload.sessionId,
      payload,
    };
  }

  /**
   * Validate refresh token and session
   * @param refreshToken - The refresh token to validate
   * @returns Validated session info
   * @throws UnauthorizedException if token is invalid
   */
  async validateRefreshToken(refreshToken: string): Promise<{
    session: any;
    user: any;
    payload: any;
  }> {
    // 1. Verify JWT refresh token
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 2. Check if token is expired
    if (this.tokenService.isTokenExpired(payload)) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // 3. Validate session exists and is valid
    const session = await this.sessionService.findByRefreshToken(refreshToken);
    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    // 4. Check if user still exists and is active
    const user = await this.usersService.findOne(session.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      session,
      user,
      payload,
    };
  }

  /**
   * Extract token from Authorization header
   * @param authHeader - Authorization header value
   * @returns Token string or null
   */
  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
}
