import { Test, TestingModule } from '@nestjs/testing';
import { SkillsService } from './skills.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { SkillsRepository } from './skills.repository';

describe('SkillsService', () => {
  let service: SkillsService;

  let skillsRepository: DeepMocked<SkillsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SkillsService,
        { provide: SkillsRepository, useValue: createMock<SkillsRepository>() },
      ],
    }).compile();

    service = module.get(SkillsService);
    skillsRepository = module.get(SkillsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
