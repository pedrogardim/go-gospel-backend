import { randomInt } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { EmailService } from '../infrastructure/email/email.service';
import { RedisService } from '../infrastructure/database/redis/redis.service';
import { UsersService } from '../users/users.service';

import { SendOtpDto } from './dto/send-otp.dto';
import { AuthWithOtpDto } from './dto/auth-with-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string) {
    let user = await this.usersService.findByEmail(email);
    let isNewUser = false;

    if (!user) {
      user = await this.usersService.create({ email });
      isNewUser = true;
    } else {
      await this.usersService.updateLastLogin(user.id);
    }

    const token = this.jwtService.sign({ id: user.id, email });
    return { accessToken: token, user, isNewUser };
  }

  async sendOtp({ email }: SendOtpDto, lang: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const code = randomInt(100000, 999999).toString();

    await this.redisService.set(`otp:${normalizedEmail}`, code, 60 * 5);
    await this.emailService.sendOtp(normalizedEmail, code, lang);
    return { message: 'OTP sent to email' };
  }

  async authWithOtp({ email, otp }: AuthWithOtpDto) {
    const normalizedEmail = email.toLowerCase().trim();

    const storedOtp = await this.redisService.get(`otp:${normalizedEmail}`);

    if (storedOtp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }
    await this.redisService.delete(`otp:${normalizedEmail}`);

    return await this.signIn(normalizedEmail);
  }
}
