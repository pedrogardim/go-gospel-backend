import { Gender } from '@prisma/client';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVolunteerDto {
  @IsString()
  fullName!: string;

  @Type(() => Date)
  @IsDate()
  birthDate!: Date;

  @IsEnum(Gender)
  gender!: Gender;

  @IsString()
  phone!: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  country!: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsUrl()
  profilePictureUrl?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  skillIds?: string[];
}
