import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export type VolunteerCreateInputWithSkillIds = Prisma.VolunteerCreateInput & {
  skillIds?: string[];
};

export type VolunteerUpdateInputWithSkillIds = Prisma.VolunteerUpdateInput & {
  skillIds?: string[];
};

const volunteerWithSkillsInclude = {
  volunteerSkillMappings: { include: { skill: true } },
} satisfies Prisma.VolunteerInclude;

@Injectable()
export class VolunteersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.volunteer.findUnique({
      where: { id },
      include: volunteerWithSkillsInclude,
    });
  }

  findByUserId(userId: string) {
    return this.prisma.volunteer.findUnique({
      where: { userId },
      include: volunteerWithSkillsInclude,
    });
  }

  create(volunteer: VolunteerCreateInputWithSkillIds) {
    const { skillIds, ...data } = volunteer;
    return this.prisma.volunteer.create({
      data: {
        ...data,
        ...(skillIds?.length && {
          volunteerSkillMappings: {
            create: skillIds.map((skillId) => ({
              skill: { connect: { id: skillId } },
            })),
          },
        }),
      },
      include: volunteerWithSkillsInclude,
    });
  }

  updateByUserId(
    userId: string,
    volunteerData: VolunteerUpdateInputWithSkillIds,
  ) {
    const { skillIds, ...data } = volunteerData;

    return this.prisma.volunteer.update({
      where: { userId },
      data: {
        ...data,
        ...(skillIds && {
          volunteerSkillMappings: {
            deleteMany: {},
            create: skillIds.map((skillId) => ({
              skill: { connect: { id: skillId } },
            })),
          },
        }),
      },
      include: volunteerWithSkillsInclude,
    });
  }

  async removeByUserId(userId: string) {
    await this.prisma.volunteerSkillMapping.deleteMany({
      where: { volunteer: { userId } },
    });
    await this.prisma.volunteer.delete({ where: { userId } });
  }
}
