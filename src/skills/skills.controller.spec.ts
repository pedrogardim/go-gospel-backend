import { Test, TestingModule } from '@nestjs/testing';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { createMock } from '@golevelup/ts-jest';

describe('SkillsController', () => {
  let controller: SkillsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SkillsController],
      providers: [
        {
          provide: SkillsService,
          useValue: createMock<SkillsService>(),
        },
      ],
    }).compile();

    controller = module.get<SkillsController>(SkillsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
