import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.url(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  REDIS_PASSWORD: z.string().optional(),

  RESEND_API_KEY: z.string(),
  RESEND_FROM: z.string(),

  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.coerce.number(),
});

export type Env = z.infer<typeof envSchema>;
