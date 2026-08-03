import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { loginAs } from './helpers/auth.helper';
import { PrismaService } from '../src/infrastructure/database/prisma/prisma.service';
import {
  organizationAreas,
  seedOrganizationAreas,
} from '../src/organization-areas/organization-areas.seed';

describe('Organization Areas (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    prisma = moduleFixture.get(PrismaService);

    await app.init();

    ({ accessToken } = await loginAs(app, 'organization@example.com'));
  });

  afterEach(async () => {
    await prisma.organizationArea.deleteMany({});
    await prisma.user.deleteMany({});
    await app.close();
  });

  it('GET /catalog/organization-areas', async () => {
    await prisma.organizationArea.deleteMany({});
    await seedOrganizationAreas(prisma);

    const { body } = await request(app.getHttpServer())
      .get('/catalog/organization-areas')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'volunteer',
          icon: 'account',
          color: '#22c55e',
          category: 'individual',
        }),
      ]),
    );
    expect(body).toHaveLength(organizationAreas.length);
  });
});
