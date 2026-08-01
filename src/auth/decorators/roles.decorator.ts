import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';

export const Roles = Reflector.createDecorator<UserType[]>();
