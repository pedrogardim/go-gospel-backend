import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { VolunteersRepository } from './volunteers.repository';

@Injectable()
export class VolunteersService {
  constructor(private readonly volunteersRepository: VolunteersRepository) {}

  findById(id: string) {
    return this.volunteersRepository.findById(id);
  }

  findByUserId(userId: string) {
    return this.volunteersRepository.findByUserId(userId);
  }

  async create(userId: string, createVolunteerDto: CreateVolunteerDto) {
    const volunteer = await this.findByUserId(userId);
    if (volunteer !== null) throw new ConflictException();

    return await this.volunteersRepository.create({
      ...createVolunteerDto,
      user: { connect: { id: userId } },
    });
  }

  async updateByUserId(userId: string, updateVolunteerDto: UpdateVolunteerDto) {
    const volunteer = await this.findByUserId(userId);
    if (volunteer === null) throw new NotFoundException();
    return await this.volunteersRepository.updateByUserId(
      userId,
      updateVolunteerDto,
    );
  }

  async removeByUserId(userId: string) {
    const volunteer = await this.findByUserId(userId);
    if (volunteer === null) throw new NotFoundException();
    await this.volunteersRepository.removeByUserId(userId);
  }
}
