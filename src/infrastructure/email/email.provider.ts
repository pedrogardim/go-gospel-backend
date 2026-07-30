import { ConfigService } from '@nestjs/config';
import { Env } from '../../config/env.schema';
import { Resend } from 'resend';

export const RESEND_CLIENT = 'RESEND_CLIENT';

export const ResendProvider = {
  provide: RESEND_CLIENT,
  useFactory: (config: ConfigService<Env, true>) => {
    return new Resend(config.get('RESEND_API_KEY'));
  },
  inject: [ConfigService],
};
