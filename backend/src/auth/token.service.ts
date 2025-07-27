import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity.js';

export interface AccessTokenPayload {
  userId: number;
  email: string;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sessionId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate short-lived access token (JWT, 15 minutes)
   * @param user - The user to generate token for
   * @param sessionId - The session ID
   * @returns Access token string
   */
  generateAccessToken(user: User, sessionId: string): string {
    const payload: AccessTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });
  }

  /**
   * Generate refresh token payload (JWT, 7 days)
   * @param sessionId - The session ID
   * @param tokenId - Unique token identifier
   * @returns Refresh token string
   */
  generateRefreshToken(sessionId: string, tokenId: string): string {
    const payload: RefreshTokenPayload = {
      sessionId,
      tokenId,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
  }

  /**
   * Verify and decode access token
   * @param token - The access token to verify
   * @returns Decoded payload or null if invalid
   */
  verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      return this.jwtService.verify<AccessTokenPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify and decode refresh token
   * @param token - The refresh token to verify
   * @returns Decoded payload or null if invalid
   */
  verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      return this.jwtService.verify<RefreshTokenPayload>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate token pair (access + refresh tokens)
   * @param user - The user to generate tokens for
   * @param sessionId - The session ID
   * @param tokenId - Unique token identifier
   * @returns Object with access and refresh tokens
   */
  generateTokenPair(user: User, sessionId: string, tokenId: string): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(user, sessionId),
      refreshToken: this.generateRefreshToken(sessionId, tokenId),
    };
  }

  /**
   * Get token expiration time from payload
   * @param payload - Token payload
   * @returns Expiration timestamp
   */
  getTokenExpiration(payload: AccessTokenPayload | RefreshTokenPayload): number {
    return payload.exp || 0;
  }

  /**
   * Check if token is expired
   * @param payload - Token payload
   * @returns True if expired
   */
  isTokenExpired(payload: AccessTokenPayload | RefreshTokenPayload): boolean {
    const exp = this.getTokenExpiration(payload);
    return exp * 1000 < Date.now();
  }
}
