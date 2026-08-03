import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export type OrganizationCreateInputWithAreaIds =
  Prisma.OrganizationCreateInput & {
    areaIds?: string[];
  };

export type OrganizationUpdateInputWithAreaIds =
  Prisma.OrganizationUpdateInput & {
    areaIds?: string[];
  };

const organizationWithAreaInclude = {
  organizationAreaMappings: { include: { organizationArea: true } },
} satisfies Prisma.OrganizationInclude;

@Injectable()
export class OrganizationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
      include: organizationWithAreaInclude,
    });
  }

  findByUserId(userId: string) {
    return this.prisma.organization.findUnique({
      where: { userId },
      include: organizationWithAreaInclude,
    });
  }

  create(organization: OrganizationCreateInputWithAreaIds) {
    const { areaIds, ...data } = organization;
    return this.prisma.organization.create({
      data: {
        ...data,
        ...(areaIds?.length && {
          organizationAreaMappings: {
            create: areaIds.map((areaId) => ({
              organizationArea: { connect: { id: areaId } },
            })),
          },
        }),
      },
      include: organizationWithAreaInclude,
    });
  }

  updateByUserId(
    userId: string,
    organizationData: OrganizationUpdateInputWithAreaIds,
  ) {
    const { areaIds, ...data } = organizationData;

    return this.prisma.organization.update({
      where: { userId },
      data: {
        ...data,
        ...(areaIds && {
          organizationAreaMappings: {
            deleteMany: {},
            create: areaIds.map((areaId) => ({
              organizationArea: { connect: { id: areaId } },
            })),
          },
        }),
      },
      include: organizationWithAreaInclude,
    });
  }

  async removeByUserId(userId: string) {
    await this.prisma.organizationAreaMapping.deleteMany({
      where: { organization: { userId } },
    });
    await this.prisma.organization.delete({ where: { userId } });
  }
}
