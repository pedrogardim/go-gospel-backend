import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationAreasController } from './organization-areas.controller';
import { OrganizationAreasService } from './organization-areas.service';
import { createMock } from '@golevelup/ts-jest';

describe('OrganizationAreasController', () => {
  let controller: OrganizationAreasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationAreasController],
      providers: [
        {
          provide: OrganizationAreasService,
          useValue: createMock<OrganizationAreasService>(),
        },
      ],
    }).compile();

    controller = module.get<OrganizationAreasController>(
      OrganizationAreasController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
