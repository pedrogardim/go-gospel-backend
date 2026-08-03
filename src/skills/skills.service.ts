import { Injectable } from '@nestjs/common';
import { SkillsRepository } from './skills.repository';
import { Skill } from '@prisma/client';

@Injectable()
export class SkillsService {
  constructor(private readonly skillsRepository: SkillsRepository) {}

  list(): Promise<Skill[]> {
    return this.skillsRepository.list();
  }
}
