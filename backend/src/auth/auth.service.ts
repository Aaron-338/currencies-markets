import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto/auth.dto.js';
import { User } from '../users/user.entity.js';
import { Profile } from '../profiles/profile.entity.js';
import { SessionService } from './session.service.js';
import { TokenService } from './token.service.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');

// Temporary line to force TypeScript re-evaluation

@Injectable()
export class AuthService {
  // In-memory token blacklist with expiry times
  private tokenBlacklist: Map<string, number> = new Map();
  
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Profile) private profilesRepository: Repository<Profile>,
    private sessionService: SessionService,
    private tokenService: TokenService,
  ) {
    // Clean up expired blacklisted tokens every 15 minutes
    setInterval(() => this.cleanupBlacklist(), 15 * 60 * 1000);
  }

  // Clean up expired tokens from the blacklist
  private cleanupBlacklist(): void {
    const now = Date.now();
    for (const [token, expiry] of this.tokenBlacklist.entries()) {
      if (expiry < now) {
        this.tokenBlacklist.delete(token);
      }
    }
  }

  // Check if a token is blacklisted
  isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklist.has(token);
  }

  // Add token to blacklist with its expiry time
  blacklistToken(token: string): void {
    try {
      // Decode token to get its expiry time
      const decoded = this.jwtService.decode(token);
      if (decoded && decoded.exp) {
        // Store token in blacklist with its expiration timestamp (in milliseconds)
        const expiryMs = decoded.exp * 1000; // Convert from seconds to milliseconds
        this.tokenBlacklist.set(token, expiryMs);
        console.log(`Token blacklisted until ${new Date(expiryMs)}`);
      }
    } catch (error) {
      console.error('Failed to blacklist token:', error);
    }
  }

  async signUp(createUserDto: CreateUserDto): Promise<any> {
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const newProfile = this.profilesRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
    });

    const newUser = await this.usersService.create({
      email: createUserDto.email,
      password: hashedPassword,
      profile: newProfile,
    });

    // Exclude password from the returned user object for security
    const { password, ...result } = newUser;
    return result;
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.usersService.findByEmail(loginUserDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
      role: user.role,
      verificationResponsibilities: user.verificationResponsibilities,
    };
    const accessToken = this.jwtService.sign(payload);

    // Return the user details along with the token
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      accessToken,
    };
  }

  async validateUser(payload: any): Promise<any> {
    return this.usersService.findOne(payload.sub);
  }

  // New method to handle user logout
  async logout(token: string): Promise<void> {
    if (token) {
      // Remove 'Bearer ' prefix if present
      const cleanToken = token.replace('Bearer ', '');
      this.blacklistToken(cleanToken);
    }
  }

  // New method to handle token refresh for hybrid authentication
  async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: any;
  }> {
    // 1. Validate the refresh token and session
    const session = await this.sessionService.findByRefreshToken(refreshToken);
    if (!session || session.isRevoked || new Date() > session.expiresAt) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // 2. Verify the JWT refresh token
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 3. Check if user still exists and is active
    const user = await this.usersService.findOne(session.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // 4. Revoke the old session
    await this.sessionService.revokeSession(session.id);

    // 5. Create new session
    const newSession = await this.sessionService.createSession(
      user,
      session.ipAddress,
      session.userAgent,
    );

    // 6. Generate new token pair
    const tokens = this.tokenService.generateTokenPair(
      user,
      newSession.id,
      newSession.refreshToken,
    );

    // 7. Return user without password and new tokens
    const { password, ...userWithoutPassword } = user;
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userWithoutPassword,
    };
  }

  async getUserSessions(userId: number): Promise<any[]> {
    const sessions = await this.sessionService.getUserSessions(userId);
    
    // Return sessions without sensitive information
    return sessions.map(session => ({
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isRevoked: session.isRevoked,
      revokedAt: session.revokedAt,
    }));
  }

  async revokeSession(userId: number, sessionId: string): Promise<{ success: boolean }> {
    const success = await this.sessionService.revokeSessionById(sessionId, userId);
    return { success };
  }

  async revokeAllSessions(userId: number): Promise<{ success: boolean }> {
    await this.sessionService.revokeAllUserSessions(userId);
    return { success: true };
  }
}
