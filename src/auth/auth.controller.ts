import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { I18nLang } from 'nestjs-i18n';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { AuthWithOtpDto } from './dto/auth-with-otp.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  sendOtp(@Body() sendOtpDto: SendOtpDto, @I18nLang() lang: string) {
    return this.authService.sendOtp(sendOtpDto, lang);
  }

  @Public()
  @Post('auth-with-otp')
  @HttpCode(HttpStatus.OK)
  authWithOtp(@Body() authWithOtpDto: AuthWithOtpDto) {
    return this.authService.authWithOtp(authWithOtpDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto);
  }
}
