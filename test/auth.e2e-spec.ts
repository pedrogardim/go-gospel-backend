import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma/prisma.service';
import { RedisService } from '../src/infrastructure/database/redis/redis.service';
import { createMock } from '@golevelup/ts-jest';
import { EmailService } from '../src/infrastructure/email/email.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let redis: RedisService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // To avoid sending emails
      .overrideProvider(EmailService)
      .useValue(createMock<EmailService>())
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    prisma = moduleFixture.get(PrismaService);
    redis = moduleFixture.get(RedisService);
    await app.init();
  });

  afterEach(async () => {
    await prisma.user.deleteMany({});
    await redis.flushall();
    await app.close();
  });

  describe('OTP complete flow', () => {
    const email = 'user@example.com';

    const runOtpFlowRequests = async () => {
      await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ email })
        .expect(200)
        .expect({ message: 'OTP sent to email' });

      const otp = await redis.get(`otp:${email}`);
      expect(otp).toBeDefined();

      const { body } = await request(app.getHttpServer())
        .post('/auth/auth-with-otp')
        .send({ email, otp })
        .expect(200);

      return body;
    };

    it('new user', async () => {
      const body = await runOtpFlowRequests();
      expect(body).toMatchObject({
        accessToken: expect.any(String),
        isNewUser: true,
        user: expect.objectContaining({ email }),
      });
    });

    it('existing user', async () => {
      await prisma.user.create({ data: { email } });
      const body = await runOtpFlowRequests();

      expect(body).toMatchObject({
        accessToken: expect.any(String),
        isNewUser: false,
        user: expect.objectContaining({ email }),
      });
    });
  });

  describe('POST /auth/send-otp', () => {
    it('returns 400 when email is missing', async () => {
      return request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({})
        .expect(400);
    });

    it('returns 400 when email is invalid', async () => {
      return request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ email: 'A' })
        .expect(400);
    });
  });

  describe('POST /auth/auth-with-otp', () => {
    it.each([
      { opt: '123456' },
      { email: 'user@example.com' },
      { email: 'com' },
    ])('returns 400 for %j', async (body) => {
      return request(app.getHttpServer())
        .post('/auth/auth-with-otp')
        .send(body)
        .expect(400);
    });

    it('returns 401 when otp is wrong or was not issued', async () => {
      return request(app.getHttpServer())
        .post('/auth/auth-with-otp')
        .send({ email: 'user@example.com', otp: '000000' })
        .expect(401);
    });

    it('returns 400 when otp is invalid', async () => {
      return request(app.getHttpServer())
        .post('/auth/auth-with-otp')
        .send({ email: 'user@example.com', otp: 'abc' })
        .expect(400);
    });
  });
});
