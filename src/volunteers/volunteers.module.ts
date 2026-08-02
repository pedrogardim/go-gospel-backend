import { Module } from '@nestjs/common';
import { VolunteersService } from './volunteers.service';
import { VolunteersController } from './volunteers.controller';
import { VolunteersRepository } from './volunteers.repository';

@Module({
  controllers: [VolunteersController],
  providers: [VolunteersService, VolunteersRepository],
})
export class VolunteersModule {}
