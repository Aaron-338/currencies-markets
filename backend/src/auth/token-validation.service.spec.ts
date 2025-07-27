import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { TokenValidationService } from './token-validation.service';
import { TokenService } from './token.service';
import { SessionService } from './session.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity.js';
import { UserRole } from '../users/user.entity.js';

describe('TokenValidationService', () => {
  let service: TokenValidationService;
  let tokenService: TokenService;
  let sessionService: SessionService;
  let usersService: UsersService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockTokenService = {
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    isTokenExpired: jest.fn(),
  };

  const mockSessionService = {
    validateSession: jest.fn(),
    findByRefreshToken: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenValidationService,
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<TokenValidationService>(TokenValidationService);
    tokenService = module.get<TokenService>(TokenService);
    sessionService = module.get<SessionService>(SessionService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateAccessToken', () => {
    const validPayload = {
      userId: 1,
      email: 'test@example.com',
      role: 'user',
      sessionId: 'session-123',
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    it('should validate valid access token successfully', async () => {
      mockTokenService.verifyAccessToken.mockReturnValue(validPayload);
      mockTokenService.isTokenExpired.mockReturnValue(false);
      mockSessionService.validateSession.mockResolvedValue(true);
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.validateAccessToken('valid-token');

      expect(result).toEqual({
        user: mockUser,
        sessionId: 'session-123',
        payload: validPayload,
      });
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockTokenService.verifyAccessToken.mockReturnValue(null);

      await expect(service.validateAccessToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateAccessToken('invalid-token')).rejects.toThrow(
        'Invalid access token',
      );
    });

    it('should throw UnauthorizedException for expired token', async () => {
      mockTokenService.verifyAccessToken.mockReturnValue(validPayload);
      mockTokenService.isTokenExpired.mockReturnValue(true);

      await expect(service.validateAccessToken('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateAccessToken('expired-token')).rejects.toThrow(
        'Access token expired',
      );
    });

    it('should throw UnauthorizedException for invalid session', async () => {
      mockTokenService.verifyAccessToken.mockReturnValue(validPayload);
      mockTokenService.isTokenExpired.mockReturnValue(false);
      mockSessionService.validateSession.mockResolvedValue(false);

      await expect(service.validateAccessToken('invalid-session')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateAccessToken('invalid-session')).rejects.toThrow(
        'Invalid session',
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      mockTokenService.verifyAccessToken.mockReturnValue(validPayload);
      mockTokenService.isTokenExpired.mockReturnValue(false);
      mockSessionService.validateSession.mockResolvedValue(true);
      mockUsersService.findOne.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(service.validateAccessToken('inactive-user')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateAccessToken('inactive-user')).rejects.toThrow(
        'User not found or inactive',
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockTokenService.verifyAccessToken.mockReturnValue(validPayload);
      mockTokenService.isTokenExpired.mockReturnValue(false);
      mockSessionService.validateSession.mockResolvedValue(true);
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.validateAccessToken('nonexistent-user')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateRefreshToken', () => {
    const mockSession = {
      id: 'session-123',
      userId: 1,
      refreshToken: 'valid-refresh-token',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isRevoked: false,
    };

    const validRefreshPayload = {
      sessionId: 'session-123',
      tokenId: 'token-456',
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    it('should validate valid refresh token successfully', async () => {
      mockTokenService.verifyRefreshToken.mockReturnValue(validRefreshPayload);
      mockTokenService.isTokenExpired.mockReturnValue(false);
      mockSessionService.findByRefreshToken.mockResolvedValue(mockSession);
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.validateRefreshToken('valid-refresh-token');

      expect(result).toEqual({
        session: mockSession,
        user: mockUser,
        payload: validRefreshPayload,
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockTokenService.verifyRefreshToken.mockReturnValue(null);

      await expect(service.validateRefreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      mockTokenService.verifyRefreshToken.mockReturnValue(validRefreshPayload);
      mockTokenService.isTokenExpired.mockReturnValue(true);

      await expect(service.validateRefreshToken('expired-refresh')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const result = service.extractTokenFromHeader('Bearer valid-token');
      expect(result).toBe('valid-token');
    });

    it('should return null for missing header', () => {
      const result = service.extractTokenFromHeader(undefined);
      expect(result).toBeNull();
    });

    it('should return null for non-Bearer header', () => {
      const result = service.extractTokenFromHeader('Basic dXNlcjpwYXNz');
      expect(result).toBeNull();
    });

    it('should return null for malformed header', () => {
      const result = service.extractTokenFromHeader('Bearer');
      expect(result).toBeNull();
    });
  });
});
