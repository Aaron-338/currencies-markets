import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity.js';
import { User } from '../users/user.entity.js';
import { randomUUID } from 'crypto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  /**
   * Create a new session for a user
   * @param user - The user to create session for
   * @param ipAddress - Optional IP address
   * @param userAgent - Optional user agent
   * @returns Created session with refresh token
   */
  async createSession(
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Session> {
    const session = this.sessionRepository.create({
      user,
      userId: user.id,
      refreshToken: randomUUID(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ipAddress,
      userAgent,
    });

    return await this.sessionRepository.save(session);
  }

  /**
   * Find a session by refresh token
   * @param refreshToken - The refresh token to search for
   * @returns Session if found and valid, null otherwise
   */
  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    const session = await this.sessionRepository.findOne({
      where: { refreshToken },
      relations: ['user'],
    });

    return session && session.isValid() ? session : null;
  }

  /**
   * Revoke a session
   * @param sessionId - The session ID to revoke
   * @returns True if revoked, false if not found
   */
  async revokeSession(sessionId: string): Promise<boolean> {
    const result = await this.sessionRepository.update(sessionId, {
      isRevoked: true,
    });

    return result.affected !== undefined && result.affected > 0;
  }

  /**
   * Revoke all sessions for a user
   * @param userId - The user ID
   * @returns Number of revoked sessions
   */
  async revokeAllSessions(userId: number): Promise<number> {
    const result = await this.sessionRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );

    return result.affected || 0;
  }

  /**
   * Get active sessions for a user
   * @param userId - The user ID
   * @returns Array of active sessions
   */
  async getActiveSessions(userId: number): Promise<Session[]> {
    return await this.sessionRepository.find({
      where: { userId, isRevoked: false },
      relations: ['user'],
    });
  }

  /**
   * Clean up expired sessions
   * @returns Number of deleted sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    await this.sessionRepository
      .createQueryBuilder()
      .delete()
      .from(Session)
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }

  async getUserSessions(userId: number): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { userId, isRevoked: false },
      order: { createdAt: 'DESC' },
    });
  }

  async revokeAllUserSessions(userId: number): Promise<void> {
    await this.sessionRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() }
    );
  }

  async revokeSessionById(sessionId: string, userId: number): Promise<boolean> {
    const result = await this.sessionRepository.update(
      { id: sessionId, userId },
      { isRevoked: true, revokedAt: new Date() }
    );
    return (result.affected || 0) > 0;
  }

  /**
   * Validate if a session is still active
   * @param sessionId - The session ID to validate
   * @returns True if valid, false otherwise
   */
  async validateSession(sessionId: string): Promise<boolean> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, isRevoked: false },
    });

    return session !== null && session.isValid();
  }
}
