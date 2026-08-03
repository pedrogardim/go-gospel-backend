import { Injectable } from '@nestjs/common';
import { OrganizationAreasRepository } from './organization-areas.repository';
import { OrganizationArea } from '@prisma/client';

@Injectable()
export class OrganizationAreasService {
  constructor(
    private readonly organizationAreasRepository: OrganizationAreasRepository,
  ) {}

  list(): Promise<OrganizationArea[]> {
    return this.organizationAreasRepository.list();
  }
}
