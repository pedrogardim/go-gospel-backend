import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationAreasService } from './organization-areas.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { OrganizationAreasRepository } from './organization-areas.repository';

describe('OrganizationAreasService', () => {
  let service: OrganizationAreasService;

  let organizationAreasRepository: DeepMocked<OrganizationAreasRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationAreasService,
        {
          provide: OrganizationAreasRepository,
          useValue: createMock<OrganizationAreasRepository>(),
        },
      ],
    }).compile();

    service = module.get(OrganizationAreasService);
    organizationAreasRepository = module.get(OrganizationAreasRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
