import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma/prisma.service';
import { RedisService } from '../src/infrastructure/database/redis/redis.service';
import { loginAs } from './helpers/auth.helper';
import { Gender, User } from '@prisma/client';
import { CreateVolunteerDto } from '../src/volunteers/dto/create-volunteer.dto';
import { UpdateVolunteerDto } from '../src/volunteers/dto/update-volunteer.dto';

describe('VolunteersController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let redis: RedisService;
  let accessToken: string;
  let user: User;

  const createVolunteerDto = {
    fullName: 'Jane Doe',
    birthDate: new Date('1995-01-15'),
    gender: Gender.FEMALE,
    phone: '+5511999999999',
    city: 'São Paulo',
    state: 'SP',
    country: 'BR',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    prisma = moduleFixture.get(PrismaService);
    redis = moduleFixture.get(RedisService);
    await app.init();

    ({ accessToken, user } = await loginAs(app, 'volunteer@example.com'));
  });

  afterEach(async () => {
    await prisma.volunteerSkillMapping.deleteMany({});
    await prisma.skill.deleteMany({});
    await prisma.volunteer.deleteMany({});
    await prisma.user.deleteMany({});
    await redis.flushall();
    await app.close();
  });

  describe('GET /volunteers/me', () => {
    it('returns user associated volunteer if exists', async () => {
      // 1. Arrange
      const skill = await prisma.skill.create({
        data: { code: 'FIRST_AID', color: '#000000' },
      });

      const volunteer = await prisma.volunteer.create({
        data: {
          ...createVolunteerDto,
          volunteerSkillMappings: {
            create: [{ skill: { connect: { id: skill.id } } }],
          },
          user: { connect: { id: user.id } },
        },
      });

      // 2. Act
      const { body } = await request(app.getHttpServer())
        .get('/volunteers/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // 3. Assert
      expect(body).toMatchObject({
        id: volunteer.id,
        userId: user.id,
        fullName: 'Jane Doe',
        birthDate: volunteer.birthDate.toISOString(),
        gender: Gender.FEMALE,
        phone: '+5511999999999',
        city: 'São Paulo',
        state: 'SP',
        country: 'BR',
        volunteerSkillMappings: [
          expect.objectContaining({
            skillId: skill.id,
            volunteerId: volunteer.id,
            skill: expect.objectContaining({
              id: skill.id,
              code: 'FIRST_AID',
              color: '#000000',
            }),
          }),
        ],
      });
    });

    it('returns 404 if user has no volunteer', () =>
      request(app.getHttpServer())
        .get('/volunteers/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect({ message: 'Not Found', statusCode: 404 })
        .expect(404));

    it('returns 401 without token', () =>
      request(app.getHttpServer()).get('/volunteers/me').expect(401));
  });

  describe('GET /volunteers/:id', () => {
    it('returns volunteer if exists', async () => {
      // 1. Arrange
      const volunteer = await prisma.volunteer.create({
        data: { ...createVolunteerDto, user: { connect: { id: user.id } } },
      });

      // 2. Act
      const { body } = await request(app.getHttpServer())
        .get(`/volunteers/${volunteer.id}`)
        .expect(200);

      // 3. Assert
      expect(body).toMatchObject({
        id: volunteer.id,
        userId: user.id,
        fullName: 'Jane Doe',
        birthDate: volunteer.birthDate.toISOString(),
        gender: Gender.FEMALE,
        phone: '+5511999999999',
        city: 'São Paulo',
        state: 'SP',
        country: 'BR',
      });
    });

    it('returns 404 if volunteer does not exist', () =>
      request(app.getHttpServer())
        .get('/volunteers/00000000-0000-0000-0000-000000000000')
        .expect({ message: 'Not Found', statusCode: 404 })
        .expect(404));

    it('returns 400 if id is invalid', () =>
      request(app.getHttpServer()).get('/volunteers/some-id').expect(400));
  });

  describe('POST /volunteers', () => {
    it('creates volunteer and links to the user', async () => {
      // 1. Arrange
      const skill = await prisma.skill.create({
        data: { code: 'FIRST_AID', color: '#000000' },
      });

      // 2. Act
      const { body } = await request(app.getHttpServer())
        .post(`/volunteers`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...createVolunteerDto,
          skillIds: [skill.id],
        } as CreateVolunteerDto)
        .expect(201);

      // 3. Assert
      expect(body).toMatchObject({
        id: expect.any(String),
        userId: user.id,
        fullName: createVolunteerDto.fullName,
        birthDate: createVolunteerDto.birthDate.toISOString(),
        gender: createVolunteerDto.gender,
        phone: createVolunteerDto.phone,
        city: createVolunteerDto.city,
        state: createVolunteerDto.state,
        country: createVolunteerDto.country,
        volunteerSkillMappings: [
          expect.objectContaining({
            skillId: skill.id,
            volunteerId: expect.any(String),
            skill: expect.objectContaining({
              id: skill.id,
              code: 'FIRST_AID',
              color: '#000000',
            }),
          }),
        ],
      });
    });

    it('returns 409 if user already has a volunteer', async () => {
      // 1. Arrange
      await prisma.volunteer.create({
        data: { ...createVolunteerDto, user: { connect: { id: user.id } } },
      });

      // 2. Act
      // 3. Assert
      await request(app.getHttpServer())
        .post(`/volunteers`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createVolunteerDto)
        .expect(409);
    });

    it('returns 400 if DTO is invalid', () =>
      request(app.getHttpServer())
        .post('/volunteers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          fullName: 123,
          birthDate: 'not-a-date',
          gender: 'INVALID',
          phone: null,
          city: true,
          state: {},
          country: [],
          profilePictureUrl: 'not-a-url',
          skillIds: ['not-a-uuid'],
        })
        .expect(400));

    it('returns 401 without token', () =>
      request(app.getHttpServer()).post('/volunteers').expect(401));
  });

  describe('PATCH /volunteers/me', () => {
    it('updates existing volunteer', async () => {
      // 1. Arrange
      const skill = await prisma.skill.create({
        data: { code: 'FIRST_AID', color: '#000000' },
      });

      const volunteer = await prisma.volunteer.create({
        data: { ...createVolunteerDto, user: { connect: { id: user.id } } },
      });

      // 2. Act
      const { body } = await request(app.getHttpServer())
        .patch(`/volunteers/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...createVolunteerDto,
          fullName: 'New full name',
          city: 'New city',
          country: 'New country',
          skillIds: [skill.id],
        } as UpdateVolunteerDto)
        .expect(200);

      // 3. Assert
      expect(body).toMatchObject({
        id: volunteer.id,
        userId: user.id,
        fullName: 'New full name',
        birthDate: createVolunteerDto.birthDate.toISOString(),
        gender: createVolunteerDto.gender,
        phone: createVolunteerDto.phone,
        city: 'New city',
        state: createVolunteerDto.state,
        country: 'New country',
        volunteerSkillMappings: [
          expect.objectContaining({
            skillId: skill.id,
            volunteerId: volunteer.id,
            skill: expect.objectContaining({
              id: skill.id,
              code: 'FIRST_AID',
              color: '#000000',
            }),
          }),
        ],
      });
    });

    it('returns 404 if user has no volunteer', () =>
      request(app.getHttpServer())
        .patch('/volunteers/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect({ message: 'Not Found', statusCode: 404 })
        .expect(404));

    it('returns 400 if DTO is invalid', async () => {
      await prisma.volunteer.create({
        data: { ...createVolunteerDto, user: { connect: { id: user.id } } },
      });

      return request(app.getHttpServer())
        .patch('/volunteers/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          fullName: 123,
          birthDate: 'not-a-date',
          gender: 'INVALID',
          phone: null,
          city: true,
          state: {},
          country: [],
          profilePictureUrl: 'not-a-url',
          skillIds: ['not-a-uuid'],
        })
        .expect(400);
    });

    it('returns 401 without token', () =>
      request(app.getHttpServer()).patch('/volunteers/me').expect(401));
  });

  describe('DELETE /volunteers/me', () => {
    it('deletes existing volunteer', async () => {
      // 1. Arrange
      await prisma.volunteer.create({
        data: { ...createVolunteerDto, user: { connect: { id: user.id } } },
      });

      // 2. Act
      await request(app.getHttpServer())
        .delete(`/volunteers/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      // 3. Assert

      const refetchedVolunteer = await prisma.volunteer.findUnique({
        where: { userId: user.id },
      });

      expect(refetchedVolunteer).toBeNull();
    });

    it('returns 404 if user has no volunteer', () =>
      request(app.getHttpServer())
        .delete('/volunteers/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect({ message: 'Not Found', statusCode: 404 })
        .expect(404));

    it('returns 401 without token', () =>
      request(app.getHttpServer()).delete('/volunteers/me').expect(401));
  });
});
