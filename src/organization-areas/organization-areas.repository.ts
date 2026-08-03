import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/database/prisma/prisma.service';
import { OrganizationArea } from '@prisma/client';

@Injectable()
export class OrganizationAreasRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<OrganizationArea[]> {
    return this.prisma.organizationArea.findMany({ orderBy: { code: 'asc' } });
  }
}
