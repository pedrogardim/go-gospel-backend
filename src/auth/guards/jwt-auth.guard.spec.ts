import { Request } from 'express';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from '../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: DeepMocked<Reflector>;
  let jwtService: DeepMocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: Reflector, useValue: createMock<Reflector>() },
        { provide: JwtService, useValue: createMock<JwtService>() },
      ],
    }).compile();

    guard = module.get(JwtAuthGuard);
    reflector = module.get(Reflector);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    const createContext = (request: Partial<Request>) =>
      createMock<ExecutionContext>({
        getHandler: () => jest.fn(),
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      });

    it('should return true for public routes', async () => {
      reflector.get.mockReturnValue(true);

      await expect(guard.canActivate(createContext({}))).resolves.toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(Public, expect.any(Function));
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization header is missing', async () => {
      reflector.get.mockReturnValue(undefined);

      await expect(
        guard.canActivate(createContext({ headers: {} })),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is not Bearer', async () => {
      reflector.get.mockReturnValue(undefined);

      await expect(
        guard.canActivate(
          createContext({ headers: { authorization: 'Basic my-token' } }),
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when jwt verification fails', async () => {
      reflector.get.mockReturnValue(undefined);
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

      await expect(
        guard.canActivate(
          createContext({ headers: { authorization: 'Bearer bad-token' } }),
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should attach user to request and return true when jwt is valid', async () => {
      reflector.get.mockReturnValue(undefined);
      const payload = { sub: 'user-id', email: 'user@example.com' };
      jwtService.verifyAsync.mockResolvedValue(payload);

      const request = { headers: { authorization: 'Bearer good-token' } };
      const result = await guard.canActivate(createContext(request));

      expect(result).toBe(true);
      expect(request['user']).toEqual(payload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('good-token');
    });
  });
});
