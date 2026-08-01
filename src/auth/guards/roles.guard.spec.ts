import { Request } from 'express';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { RolesGuard } from './roles.guard';
import { Roles } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: DeepMocked<Reflector>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: createMock<Reflector>() },
      ],
    }).compile();

    guard = module.get(RolesGuard);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    const createContext = (request: Record<string, unknown> = {}) =>
      createMock<ExecutionContext>({
        getHandler: () => jest.fn(),
        getClass: () => jest.fn(),
        switchToHttp: () => ({
          getRequest: () => request as Partial<Request>,
        }),
      });

    it('should return true when no roles are required', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);

      expect(guard.canActivate(createContext())).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(Roles, [
        expect.any(Function),
        expect.any(Function),
      ]);
    });

    it('should return true when roles metadata is empty', () => {
      reflector.getAllAndOverride.mockReturnValue([]);

      expect(guard.canActivate(createContext())).toBe(true);
    });

    it('should return true when user has a required role', () => {
      reflector.getAllAndOverride.mockReturnValue([
        UserType.ORGANIZATION,
        UserType.SUPER_ADMIN,
      ]);

      expect(
        guard.canActivate(
          createContext({ user: { userType: UserType.ORGANIZATION } }),
        ),
      ).toBe(true);
    });

    it('should throw ForbiddenException when user is missing', () => {
      reflector.getAllAndOverride.mockReturnValue([UserType.VOLUNTEER]);

      expect(() => guard.canActivate(createContext({}))).toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when userType is missing', () => {
      reflector.getAllAndOverride.mockReturnValue([UserType.VOLUNTEER]);

      expect(() =>
        guard.canActivate(createContext({ user: {} })),
      ).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user does not have required role', () => {
      reflector.getAllAndOverride.mockReturnValue([UserType.ORGANIZATION]);

      expect(() =>
        guard.canActivate(
          createContext({ user: { userType: UserType.VOLUNTEER } }),
        ),
      ).toThrow(ForbiddenException);
    });
  });
});
