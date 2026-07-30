import { IsEmail, IsString, Matches } from 'class-validator';

export class AuthWithOtpDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^\d{6}$/)
  otp!: string;
}
