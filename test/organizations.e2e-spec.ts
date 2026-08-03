import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma/prisma.service';
import { RedisService } from '../src/infrastructure/database/redis/redis.service';
import { loginAs } from './helpers/auth.helper';
import { User } from '@prisma/client';
import { CreateOrganizationDto } from '../src/organizations/dto/create-organization.dto';
import { UpdateOrganizationDto } from '../src/organizations/dto/update-organization.dto';

describe('OrganizationsController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let redis: RedisService;
  let accessToken: string;
  let user: User;

  const createOrganizationDto = {
    name: 'Hope Community Church',
    description: 'A local church serving the community',
    websiteUrl: 'https://hopecommunity.example.com',
    address: '123 Main St, São Paulo, SP',
    latitude: -23.5505,
    longitude: -46.6333,
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

    ({ accessToken, user } = await loginAs(app, 'organization@example.com'));
  });

  afterEach(async () => {
    await prisma.organizationAreaMapping.deleteMany({});
    await prisma.organizationArea.deleteMany({});
    await prisma.organization.deleteMany({});
    await prisma.user.deleteMany({});
    await redis.flushall();
    await app.close();
  });

  describe('GET /organizations/me', () => {
    it('returns user associated organization if exists', async () => {
      // 1. Arrange
      const area = await prisma.organizationArea.create({
        data: {
          code: 'EDUCATION',
          icon: 'book',
          color: '#000000',
          category: 'SERVICE',
        },
      });

      const organization = await prisma.organization.create({
        data: {
          ...createOrganizationDto,
          organizationAreaMappings: {
            create: [{ organizationArea: { connect: { id: area.id } } }],
          },
          user: { connect: { id: user.id } },
        },
      });

      // 2. Act
      const { body } = await request(app.getHttpServer())
        .get('/organizations/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // 3. Assert
      expect(body).toMatchObject({
        id: organization.id,
        userId: user.id,
        name: 'Hope Community Church',
        description: 'A local church serving the community',
        websiteUrl: 'https://hopecommunity.example.com',
        address: '123 Main St, São Paulo, SP',
        latitude: -23.5505,
        longitude: -46.6333,
        organizationAreaMappings: [
          expect.objectContaining({
            organizationAreaId: area.id,
            organizationId: organization.id,
            organizationArea: expect.objectContaining({
              id: area.id,
              code: 'EDUCATION',
              icon: 'book',
              color: '#000000',
              category: 'SERVICE',
            }),
          }),
        ],
      });
    });

    it('returns 404 if user has no organization', () =>
      request(app.getHttpServer())
        .get('/organizations/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect({ message: 'Not Found', statusCode: 404 })
        .expect(404));

    it('returns 401 without token', () =>
      request(app.getHttpServer()).get('/organizations/me').expect(401));
  });

  describe('GET /organizations/:id', () => {
    it('returns organization if exists', async () => {
      // 1. Arrange
      const organization = await prisma.organization.create({
        data: { ...createOrganizationDto, user: { connect: { id: user.id } } },
      });

      // 2. Act
      const { body } = await request(app.getHttpServer())
        .get(`/organizations/${organization.id}`)
        .expect(200);

      // 3. Assert
      expect(body).toMatchObject({
        id: organization.id,
        userId: user.id,
        name: 'Hope Community Church',
        description: 'A local church serving the community',
        websiteUrl: 'https://hopecommunity.example.com',
        address: '123 Main St, São Paulo, SP',
        latitude: -23.5505,
        longitude: -46.6333,
      });
    });

    it('returns 404 if organization does not exist', () =>
      request(app.getHttpServer())
        .get('/organizations/00000000-0000-0000-0000-000000000000')
        .expect({ message: 'Not Found', statusCode: 404 })
        .expect(404));

    it('returns 400 if id is invalid', () =>
      request(app.getHttpServer()).get('/organizations/some-id').expect(400));
  });

  describe('POST /organizations', () => {
    it('creates organization and links to the user', async () => {
      // 1. Arrange
      const area = await prisma.organizationArea.create({
        data: {
          code: 'EDUCATION',
          icon: 'book',
          color: '#000000',
          category: 'SERVICE',
        },
      });

      // 2. Act
      const { body } = await request(app.getHttpServer())
        .post(`/organizations`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...createOrganizationDto,
          areaIds: [area.id],
        } as CreateOrganizationDto)
        .expect(201);

      // 3. Assert
      expect(body).toMatchObject({
        id: expect.any(String),
        userId: user.id,
        name: createOrganizationDto.name,
        description: createOrganizationDto.description,
        websiteUrl: createOrganizationDto.websiteUrl,
        address: createOrganizationDto.address,
        latitude: createOrganizationDto.latitude,
        longitude: createOrganizationDto.longitude,
        organizationAreaMappings: [
          expect.objectContaining({
            organizationAreaId: area.id,
            organizationId: expect.any(String),
            organizationArea: expect.objectContaining({
              id: area.id,
              code: 'EDUCATION',
              icon: 'book',
              color: '#000000',
              category: 'SERVICE',
            }),
          }),
        ],
      });
    });

    it('returns 409 if user already has a organization', async () => {
      // 1. Arrange
      await prisma.organization.create({
        data: { ...createOrganizationDto, user: { connect: { id: user.id } } },
      });

      // 2. Act
      // 3. Assert
      await request(app.getHttpServer())
        .post(`/organizations`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createOrganizationDto)
        .expect(409);
    });

    it('returns 400 if DTO is invalid', () =>
      request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 123,
          description: true,
          websiteUrl: 'not-a-url',
          logoUrl: 'not-a-url',
          address: {},
          latitude: 'not-a-number',
          longitude: null,
          areaIds: ['not-a-uuid'],
        })
        .expect(400));

    it('returns 401 without token', () =>
      request(app.getHttpServer()).post('/organizations').expect(401));
  });

  describe('PATCH /organizations/me', () => {
    it('updates existing organization', async () => {
      // 1. Arrange
      const area = await prisma.organizationArea.create({
        data: {
          code: 'EDUCATION',
          icon: 'book',
          color: '#000000',
          category: 'SERVICE',
        },
      });

      const organization = await prisma.organization.create({
        data: { ...createOrganizationDto, user: { connect: { id: user.id } } },
      });

      // 2. Act
      const { body } = await request(app.getHttpServer())
        .patch(`/organizations/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          ...createOrganizationDto,
          name: 'New organization name',
          address: 'New address',
          description: 'New description',
          areaIds: [area.id],
        } as UpdateOrganizationDto)
        .expect(200);

      // 3. Assert
      expect(body).toMatchObject({
        id: organization.id,
        userId: user.id,
        name: 'New organization name',
        description: 'New description',
        websiteUrl: createOrganizationDto.websiteUrl,
        address: 'New address',
        latitude: createOrganizationDto.latitude,
        longitude: createOrganizationDto.longitude,
        organizationAreaMappings: [
          expect.objectContaining({
            organizationAreaId: area.id,
            organizationId: organization.id,
            organizationArea: expect.objectContaining({
              id: area.id,
              code: 'EDUCATION',
              icon: 'book',
              color: '#000000',
              category: 'SERVICE',
            }),
          }),
        ],
      });
    });

    it('returns 404 if user has no organization', () =>
      request(app.getHttpServer())
        .patch('/organizations/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect({ message: 'Not Found', statusCode: 404 })
        .expect(404));

    it('returns 400 if DTO is invalid', async () => {
      await prisma.organization.create({
        data: { ...createOrganizationDto, user: { connect: { id: user.id } } },
      });

      return request(app.getHttpServer())
        .patch('/organizations/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 123,
          description: true,
          websiteUrl: 'not-a-url',
          logoUrl: 'not-a-url',
          address: {},
          latitude: 'not-a-number',
          longitude: null,
          areaIds: ['not-a-uuid'],
        })
        .expect(400);
    });

    it('returns 401 without token', () =>
      request(app.getHttpServer()).patch('/organizations/me').expect(401));
  });

  describe('DELETE /organizations/me', () => {
    it('deletes existing organization', async () => {
      // 1. Arrange
      await prisma.organization.create({
        data: { ...createOrganizationDto, user: { connect: { id: user.id } } },
      });

      // 2. Act
      await request(app.getHttpServer())
        .delete(`/organizations/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      // 3. Assert

      const refetchedOrganization = await prisma.organization.findUnique({
        where: { userId: user.id },
      });

      expect(refetchedOrganization).toBeNull();
    });

    it('returns 404 if user has no organization', () =>
      request(app.getHttpServer())
        .delete('/organizations/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect({ message: 'Not Found', statusCode: 404 })
        .expect(404));

    it('returns 401 without token', () =>
      request(app.getHttpServer()).delete('/organizations/me').expect(401));
  });
});
