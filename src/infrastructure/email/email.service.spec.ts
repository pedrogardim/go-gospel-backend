import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CreateEmailResponse, Resend } from 'resend';

import { EmailService } from './email.service';
import { Env } from '../../config/env.schema';
import { RESEND_CLIENT } from './email.provider';

describe('EmailService', () => {
  let service: EmailService;
  let config: DeepMocked<ConfigService<Env, true>>;
  let i18n: DeepMocked<I18nService>;
  let resend: DeepMocked<Resend>;

  beforeEach(async () => {
    resend = createMock<Resend>();
    resend.emails.send.mockResolvedValue({
      error: null,
    } as CreateEmailResponse);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: RESEND_CLIENT, useValue: resend },
        { provide: I18nService, useValue: createMock<I18nService>() },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService<Env, true>>(),
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    config = module.get(ConfigService);
    i18n = module.get(I18nService);

    config.get.mockImplementation((key: string) => {
      const values: Record<string, string> = {
        RESEND_FROM: 'noreply@example.com',
      };
      return values[key];
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendOtp', () => {
    const email = 'user@example.com';
    const code = '123456';
    const lang = 'en';

    beforeEach(() => {
      i18n.t.mockReturnValue({
        subject: 'Your OTP code',
        text: 'Your verification code is 123456',
      });
    });

    it('should translate OTP template and send email via Resend', async () => {
      // 1. Arrange
      // 2. Act
      await service.sendOtp(email, code, lang);

      // 3. Assert
      expect(i18n.t).toHaveBeenCalledWith('email.otp', {
        lang,
        args: { code },
      });

      expect(resend.emails.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: email,
        subject: 'Your OTP code',
        text: 'Your verification code is 123456',
      });
    });

    it('should throw InternalServerErrorException when Resend returns an error', async () => {
      // 1. Arrange
      resend.emails.send.mockResolvedValue({
        error: { message: 'Failed to send email' },
      } as CreateEmailResponse);

      // 2. Act
      // 3. Assert
      await expect(service.sendOtp(email, code, lang)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
