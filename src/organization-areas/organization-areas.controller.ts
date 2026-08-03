import { Controller, Get } from '@nestjs/common';
import { OrganizationAreasService } from './organization-areas.service';

@Controller('catalog/organization-areas')
export class OrganizationAreasController {
  constructor(
    private readonly organizationAreasService: OrganizationAreasService,
  ) {}

  @Get()
  list() {
    return this.organizationAreasService.list();
  }
}
