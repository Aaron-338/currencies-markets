import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';
import { User } from '../users/user.entity.js';
import { UserRole } from '../users/user.entity.js';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_SECRET: 'test-jwt-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
      };
      return config[key];
    }),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate access token with correct payload', () => {
      const mockToken = 'mock-access-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = service.generateAccessToken(mockUser, 'session-123');

      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          userId: 1,
          email: 'test@example.com',
          role: 'user',
          sessionId: 'session-123',
        },
        {
          secret: 'test-jwt-secret',
          expiresIn: '15m',
        },
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token with correct payload', () => {
      const mockToken = 'mock-refresh-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = service.generateRefreshToken('session-123', 'token-456');

      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sessionId: 'session-123',
          tokenId: 'token-456',
        },
        {
          secret: 'test-refresh-secret',
          expiresIn: '7d',
        },
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const mockPayload = {
        userId: 1,
        email: 'test@example.com',
        role: 'user',
        sessionId: 'session-123',
      };
      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = service.verifyAccessToken('valid-token');

      expect(jwtService.verify).toHaveBeenCalledWith('valid-token', {
        secret: 'test-jwt-secret',
      });
      expect(result).toEqual(mockPayload);
    });

    it('should return null for invalid access token', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = service.verifyAccessToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const mockPayload = {
        sessionId: 'session-123',
        tokenId: 'token-456',
      };
      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = service.verifyRefreshToken('valid-refresh-token');

      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token', {
        secret: 'test-refresh-secret',
      });
      expect(result).toEqual(mockPayload);
    });

    it('should return null for invalid refresh token', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = service.verifyRefreshToken('invalid-refresh-token');

      expect(result).toBeNull();
    });
  });

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = service.generateTokenPair(mockUser, 'session-123', 'token-456');

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired token', () => {
      const expiredPayload = {
        userId: 1,
        email: 'test@example.com',
        role: 'user',
        sessionId: 'session-123',
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };

      const result = service.isTokenExpired(expiredPayload);
      expect(result).toBe(true);
    });

    it('should return false for valid token', () => {
      const validPayload = {
        userId: 1,
        email: 'test@example.com',
        role: 'user',
        sessionId: 'session-123',
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };

      const result = service.isTokenExpired(validPayload);
      expect(result).toBe(false);
    });
  });

  describe('getTokenExpiration', () => {
    it('should return correct expiration time', () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'user',
        sessionId: 'session-123',
        exp: 1234567890,
      };

      const result = service.getTokenExpiration(payload);
      expect(result).toBe(1234567890);
    });

    it('should return 0 if exp is undefined', () => {
      const payload = {
        userId: 1,
        email: 'test@example.com',
        role: 'user',
        sessionId: 'session-123',
      };

      const result = service.getTokenExpiration(payload);
      expect(result).toBe(0);
    });
  });
});
