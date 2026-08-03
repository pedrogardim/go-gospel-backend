import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationsRepository } from './organizations.repository';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
  ) {}

  findById(id: string) {
    return this.organizationsRepository.findById(id);
  }

  findByUserId(userId: string) {
    return this.organizationsRepository.findByUserId(userId);
  }

  async create(userId: string, createOrganizationDto: CreateOrganizationDto) {
    const organization = await this.findByUserId(userId);
    if (organization !== null) throw new ConflictException();

    return await this.organizationsRepository.create({
      ...createOrganizationDto,
      user: { connect: { id: userId } },
    });
  }

  async updateByUserId(
    userId: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ) {
    const organization = await this.findByUserId(userId);
    if (organization === null) throw new NotFoundException();
    return await this.organizationsRepository.updateByUserId(
      userId,
      updateOrganizationDto,
    );
  }

  async removeByUserId(userId: string) {
    const organization = await this.findByUserId(userId);
    if (organization === null) throw new NotFoundException();
    await this.organizationsRepository.removeByUserId(userId);
  }
}
