import { Test, TestingModule } from '@nestjs/testing';
import { VolunteersService } from './volunteers.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { VolunteersRepository } from './volunteers.repository';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('VolunteersService', () => {
  let service: VolunteersService;

  let volunteersRepository: DeepMocked<VolunteersRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VolunteersService,
        {
          provide: VolunteersRepository,
          useValue: createMock<VolunteersRepository>(),
        },
      ],
    }).compile();

    service = module.get(VolunteersService);
    volunteersRepository = module.get(VolunteersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should connect given user id to created volunteer', async () => {
      const id = 'user-id';
      const createDto = createMock<CreateVolunteerDto>();

      volunteersRepository.findByUserId.mockResolvedValue(null);

      await service.create(id, createDto);

      expect(volunteersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ user: { connect: { id } } }),
      );
    });

    it('should throw ConflictException if volunteer already exists', async () => {
      const id = 'user-id';
      const createDto = createMock<CreateVolunteerDto>();
      volunteersRepository.findByUserId.mockResolvedValue(
        createMock() as Awaited<
          ReturnType<VolunteersRepository['findByUserId']>
        >,
      );

      await expect(service.create(id, createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('updateByUserId', () => {
    it('should throw NotFoundException if volunteer does not exist', async () => {
      const id = 'user-id';
      const updateDto = createMock<UpdateVolunteerDto>();

      volunteersRepository.findByUserId.mockResolvedValue(null);

      await expect(service.updateByUserId(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeByUserId', () => {
    it('should throw NotFoundException if volunteer does not exist', async () => {
      const id = 'user-id';

      volunteersRepository.findByUserId.mockResolvedValue(null);

      await expect(service.removeByUserId(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
