import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsService } from './organizations.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { OrganizationsRepository } from './organizations.repository';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

describe('OrganizationsService', () => {
  let service: OrganizationsService;

  let organizationsRepository: DeepMocked<OrganizationsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: OrganizationsRepository,
          useValue: createMock<OrganizationsRepository>(),
        },
      ],
    }).compile();

    service = module.get(OrganizationsService);
    organizationsRepository = module.get(OrganizationsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should connect given user id to created organization', async () => {
      const id = 'user-id';
      const createDto = createMock<CreateOrganizationDto>();

      organizationsRepository.findByUserId.mockResolvedValue(null);

      await service.create(id, createDto);

      expect(organizationsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ user: { connect: { id } } }),
      );
    });

    it('should throw ConflictException if organization already exists', async () => {
      const id = 'user-id';
      const createDto = createMock<CreateOrganizationDto>();
      organizationsRepository.findByUserId.mockResolvedValue(
        createMock() as Awaited<
          ReturnType<OrganizationsRepository['findByUserId']>
        >,
      );

      await expect(service.create(id, createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('updateByUserId', () => {
    it('should throw NotFoundException if organization does not exist', async () => {
      const id = 'user-id';
      const updateDto = createMock<UpdateOrganizationDto>();

      organizationsRepository.findByUserId.mockResolvedValue(null);

      await expect(service.updateByUserId(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeByUserId', () => {
    it('should throw NotFoundException if organization does not exist', async () => {
      const id = 'user-id';

      organizationsRepository.findByUserId.mockResolvedValue(null);

      await expect(service.removeByUserId(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
