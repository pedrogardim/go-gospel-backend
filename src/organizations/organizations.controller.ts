import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserContext } from '../auth/decorators/current-user.decorator';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('me')
  async getMe(@CurrentUser() user: UserContext) {
    const organization = await this.organizationsService.findByUserId(user.sub);
    if (!organization) throw new NotFoundException();

    return organization;
  }

  @Public()
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const organization = await this.organizationsService.findById(id);
    if (!organization) throw new NotFoundException();

    return organization;
  }

  @Post()
  async create(
    @CurrentUser() user: UserContext,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ) {
    return this.organizationsService.create(user.sub, createOrganizationDto);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: UserContext,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.updateByUserId(
      user.sub,
      updateOrganizationDto,
    );
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMe(@CurrentUser() user: UserContext) {
    return this.organizationsService.removeByUserId(user.sub);
  }
}
