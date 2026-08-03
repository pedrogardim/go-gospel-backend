import { Controller, Get } from '@nestjs/common';
import { SkillsService } from './skills.service';

@Controller('catalog/skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  list() {
    return this.skillsService.list();
  }
}
