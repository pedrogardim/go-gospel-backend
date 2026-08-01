import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { EmailModule } from '../infrastructure/email/email.module';
import { RedisModule } from '../infrastructure/database/redis/redis.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [EmailModule, RedisModule, UsersModule],
  providers: [
    AuthService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
