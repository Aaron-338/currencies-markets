import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionService } from './session.service';
import { Session } from './session.entity.js';
import { User } from '../users/user.entity.js';

describe('SessionService', () => {
  let service: SessionService;
  let repository: Repository<Session>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedpassword',
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: getRepositoryToken(Session),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    repository = module.get<Repository<Session>>(getRepositoryToken(Session));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a new session with correct properties', async () => {
      const expectedSession = {
        id: 'test-session-id',
        user: mockUser,
        userId: mockUser.id,
        refreshToken: expect.any(String),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        isRevoked: false,
        isValid: expect.any(Function),
      };

      mockRepository.create.mockReturnValue(expectedSession);
      mockRepository.save.mockResolvedValue(expectedSession);

      const result = await service.createSession(
        mockUser,
        '192.168.1.1',
        'Mozilla/5.0',
      );

      expect(repository.create).toHaveBeenCalledWith({
        user: mockUser,
        userId: mockUser.id,
        refreshToken: expect.any(String),
        expiresAt: expect.any(Date),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });
      expect(result.refreshToken).toBeDefined();
      expect(new Date(result.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('findByRefreshToken', () => {
    it('should return session if found and valid', async () => {
      const mockSession = {
        id: 'test-session-id',
        user: mockUser,
        refreshToken: 'valid-refresh-token',
        expiresAt: new Date(Date.now() + 1000000),
        isRevoked: false,
        isValid: () => true,
      };

      mockRepository.findOne.mockResolvedValue(mockSession);

      const result = await service.findByRefreshToken('valid-refresh-token');

      expect(result).toEqual(mockSession);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { refreshToken: 'valid-refresh-token' },
        relations: ['user'],
      });
    });

    it('should return null if session is revoked', async () => {
      const mockSession = {
        id: 'test-session-id',
        user: mockUser,
        refreshToken: 'revoked-refresh-token',
        expiresAt: new Date(Date.now() + 1000000),
        isRevoked: true,
        isValid: () => false,
      };

      mockRepository.findOne.mockResolvedValue(mockSession);

      const result = await service.findByRefreshToken('revoked-refresh-token');

      expect(result).toBeNull();
    });

    it('should return null if session is expired', async () => {
      const mockSession = {
        id: 'test-session-id',
        user: mockUser,
        refreshToken: 'expired-refresh-token',
        expiresAt: new Date(Date.now() - 1000000),
        isRevoked: false,
        isValid: () => false,
      };

      mockRepository.findOne.mockResolvedValue(mockSession);

      const result = await service.findByRefreshToken('expired-refresh-token');

      expect(result).toBeNull();
    });
  });

  describe('revokeSession', () => {
    it('should revoke session successfully', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.revokeSession('session-id');

      expect(result).toBe(true);
      expect(repository.update).toHaveBeenCalledWith('session-id', {
        isRevoked: true,
      });
    });

    it('should return false if session not found', async () => {
      mockRepository.update.mockResolvedValue({ affected: 0 });

      const result = await service.revokeSession('non-existent-session');

      expect(result).toBe(false);
    });
  });

  describe('validateSession', () => {
    it('should return true for valid session', async () => {
      const mockSession = {
        id: 'valid-session-id',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 1000000),
        isValid: () => true,
      };

      mockRepository.findOne.mockResolvedValue(mockSession);

      const result = await service.validateSession('valid-session-id');

      expect(result).toBe(true);
    });

    it('should return false for non-existent session', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.validateSession('non-existent-session');

      expect(result).toBe(false);
    });

    it('should return false for revoked session', async () => {
      const mockSession = {
        id: 'revoked-session-id',
        isRevoked: true,
        expiresAt: new Date(Date.now() + 1000000),
        isValid: () => false,
      };

      mockRepository.findOne.mockResolvedValue(mockSession);

      const result = await service.validateSession('revoked-session-id');

      expect(result).toBe(false);
    });
  });
});
