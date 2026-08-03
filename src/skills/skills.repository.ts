import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/database/prisma/prisma.service';
import { Skill } from '@prisma/client';

@Injectable()
export class SkillsRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<Skill[]> {
    return this.prisma.skill.findMany({ orderBy: { code: 'asc' } });
  }
}
