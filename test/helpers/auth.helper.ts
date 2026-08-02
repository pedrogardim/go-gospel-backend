import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { App } from 'supertest/types';
import { PrismaService } from '../../src/infrastructure/database/prisma/prisma.service';
import { UserContext } from '../../src/auth/decorators/current-user.decorator';

export const loginAs = async (app: INestApplication<App>, email: string) => {
  const jwtService = app.get(JwtService);
  const prisma = app.get(PrismaService);

  const user = await prisma.user.create({ data: { email } });
  const accessToken = await jwtService.signAsync({
    sub: user.id,
    email: user.email,
    userType: user.userType,
  } as UserContext);

  return { accessToken, user };
};
