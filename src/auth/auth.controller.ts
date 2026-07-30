import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { I18nLang } from 'nestjs-i18n';
import { AuthWithOtpDto } from './dto/auth-with-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  sendOtp(@Body() sendOtpDto: SendOtpDto, @I18nLang() lang: string) {
    return this.authService.sendOtp(sendOtpDto, lang);
  }

  @Post('auth-with-otp')
  @HttpCode(HttpStatus.OK)
  authWithOtp(@Body() authWithOtpDto: AuthWithOtpDto) {
    return this.authService.authWithOtp(authWithOtpDto);
  }
}
