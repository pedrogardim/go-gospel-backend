import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailModule } from '../infrastructure/email/email.module';
import { RedisModule } from '../infrastructure/database/redis/redis.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [EmailModule, RedisModule, UsersModule],
  providers: [AuthService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
