import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { Env } from '../../config/env.schema';
import { I18nService } from 'nestjs-i18n';
import { RESEND_CLIENT } from './email.provider';

@Injectable()
export class EmailService {
  constructor(
    @Inject(RESEND_CLIENT) private readonly resend: Resend,
    private readonly config: ConfigService<Env, true>,
    private readonly i18n: I18nService,
  ) {}

  async sendOtp(email: string, code: string, lang: string) {
    const { subject, text } = this.i18n.t('email.otp', {
      lang,
      args: { code },
    }) as {
      subject: string;
      text: string;
    };

    const { error } = await this.resend.emails.send({
      from: this.config.get('RESEND_FROM'),
      to: email,
      subject,
      text,
    });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
