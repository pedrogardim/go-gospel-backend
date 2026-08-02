import { Test, TestingModule } from '@nestjs/testing';
import { VolunteersService } from './volunteers.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { VolunteersRepository } from './volunteers.repository';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';

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
      await service.create(id, createDto);

      expect(volunteersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ user: { connect: { id } } }),
      );
    });
  });
});
