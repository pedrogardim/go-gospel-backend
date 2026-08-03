import { Module } from '@nestjs/common';
import { OrganizationAreasService } from './organization-areas.service';
import { OrganizationAreasController } from './organization-areas.controller';
import { OrganizationAreasRepository } from './organization-areas.repository';

@Module({
  controllers: [OrganizationAreasController],
  providers: [OrganizationAreasService, OrganizationAreasRepository],
  exports: [OrganizationAreasService],
})
export class OrganizationAreasModule {}
