import path from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';

import { Env, envSchema } from './config/env.schema';
import { AppController } from './app.controller';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './infrastructure/email/email.module';
import { RedisModule } from './infrastructure/database/redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { VolunteersModule } from './volunteers/volunteers.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { SkillsModule } from './skills/skills.module';
import { OrganizationAreasModule } from './organization-areas/organization-areas.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN', { infer: true }),
        },
      }),
    }),
    PrismaModule,
    EmailModule,
    AuthModule,
    RedisModule,
    UsersModule,
    VolunteersModule,
    OrganizationsModule,
    SkillsModule,
    OrganizationAreasModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
