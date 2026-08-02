import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UsersRepository } from './users.repository';

describe('UsersService', () => {
  let service: UsersService;

  let usersRepository: DeepMocked<UsersRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: createMock<UsersRepository>() },
      ],
    }).compile();

    service = module.get(UsersService);
    usersRepository = module.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateLastLogin', () => {
    it('should update lastLoginAt via repository', async () => {
      const id = 'user-id';
      await service.updateLastLogin(id);
      expect(usersRepository.update).toHaveBeenCalledWith(
        id,
        expect.objectContaining({ lastLoginAt: expect.any(Date) }),
      );
    });
  });
});
