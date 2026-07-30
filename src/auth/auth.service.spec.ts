import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

import { EmailService } from '../infrastructure/email/email.service';
import { AuthService } from './auth.service';
import { RedisService } from '../infrastructure/database/redis/redis.service';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  let emailService: DeepMocked<EmailService>;
  let usersService: DeepMocked<UsersService>;
  let redisService: DeepMocked<RedisService>;
  let jwtService: DeepMocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: EmailService, useValue: createMock<EmailService>() },
        { provide: UsersService, useValue: createMock<UsersService>() },
        { provide: RedisService, useValue: createMock<RedisService>() },
        { provide: JwtService, useValue: createMock<JwtService>() },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    emailService = module.get(EmailService);
    usersService = module.get(UsersService);
    redisService = module.get(RedisService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should create a new user if user is NOT found in database', async () => {
      // 1. Arrange
      const user = createMock<User>({
        id: 'user-id',
        email: 'user@example.com',
      });
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(user);
      jwtService.sign.mockReturnValue('access-token');

      // 2. Act
      const response = await service.signIn('user@example.com');

      // 3. Assert
      expect(response.accessToken).toBe('access-token');
      expect(response.user).toEqual(user);
      expect(response.isNewUser).toEqual(true);

      expect(usersService.create).toHaveBeenCalled();
      expect(usersService.updateLastLogin).not.toHaveBeenCalled();
    });

    it('should update last login if user ALREADY exists', async () => {
      // 1. Arrange
      usersService.findByEmail.mockResolvedValue(
        createMock<User>({ id: 'user-id' }),
      );

      // 2. Act
      const response = await service.signIn('user@example.com');
      expect(response.isNewUser).toEqual(false);

      // 3. Assert
      expect(usersService.updateLastLogin).toHaveBeenCalled();
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('sendOtp', () => {
    it('should normalize email, store 6-digit OTP in Redis with 300s TTL, and send email', async () => {
      // 1. Arrange
      const email = ' TEST@example.com ';
      const normalizedEmail = email.toLowerCase().trim();
      const userLocale = 'en';

      // 2. Act
      await service.sendOtp({ email }, userLocale);

      // 3. Assert
      expect(redisService.set).toHaveBeenCalledWith(
        `otp:${normalizedEmail}`,
        expect.stringMatching(/^\d{6}$/),
        300,
      );

      expect(emailService.sendOtp).toHaveBeenCalledWith(
        normalizedEmail,
        expect.stringMatching(/^\d{6}$/),
        userLocale,
      );
    });
  });

  describe('authWithOtp', () => {
    it('should throw UnauthorizedException if OTP is invalid or expired', async () => {
      // 1. Arrange
      redisService.get.mockResolvedValue(null);

      // 2. Act
      // 3. Assert
      await expect(
        service.authWithOtp({
          email: 'user@example.com',
          otp: '123456',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should delete OTP from Redis and complete signIn if OTP is valid', async () => {
      // 1. Arrange
      redisService.get.mockResolvedValue('123456');

      const spy = jest.spyOn(service, 'signIn');

      // 2. Act
      await service.authWithOtp({
        email: 'user@example.com',
        otp: '123456',
      });

      // 3. Assert
      expect(redisService.delete).toHaveBeenCalledWith('otp:user@example.com');
      expect(spy).toHaveBeenCalledWith('user@example.com');
    });
  });
});
