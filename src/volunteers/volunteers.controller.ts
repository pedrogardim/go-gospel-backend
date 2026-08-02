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
import { VolunteersService } from './volunteers.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserContext } from '../auth/decorators/current-user.decorator';

@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: UserContext) {
    const volunteer = await this.volunteersService.findByUserId(user.sub);
    if (!volunteer) throw new NotFoundException();

    return volunteer;
  }

  @Public()
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const volunteer = await this.volunteersService.findById(id);
    if (!volunteer) throw new NotFoundException();

    return volunteer;
  }

  @Post()
  async create(
    @CurrentUser() user: UserContext,
    @Body() createVolunteerDto: CreateVolunteerDto,
  ) {
    return this.volunteersService.create(user.sub, createVolunteerDto);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: UserContext,
    @Body() updateVolunteerDto: UpdateVolunteerDto,
  ) {
    return this.volunteersService.updateByUserId(user.sub, updateVolunteerDto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMe(@CurrentUser() user: UserContext) {
    return this.volunteersService.removeByUserId(user.sub);
  }
}
