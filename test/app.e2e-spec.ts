import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { faker } from '@faker-js/faker';
import { SignupDto } from '../src/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });
  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const email = faker.internet.email();
    const username = faker.internet.userName();
    const password = faker.internet.password(12);
    const dto: SignupDto = { email, username, password };
    describe('Signup', () => {
      it('Should throw exception if missing email', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: faker.internet.password(12),
          })
          .expectStatus(400);
      });
      it('Should throw exception if missing password', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: faker.internet.email(),
          })
          .expectStatus(400);
      });
      it('Should throw exception if no body', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('Should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Login', () => {
      it('Should login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'authToken');
      });
      it('Should throw exception if missing email', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            password: faker.internet.password(12),
          })
          .expectStatus(400);
      });
      it('Should throw exception if missing password', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            password: faker.internet.email(),
          })
          .expectStatus(400);
      });
      it('Should throw exception if no body', () => {
        return pactum.spec().post('/auth/login').expectStatus(400);
      });
    });
  });
  describe('User', () => {
    describe('Get me', () => {
      it('Should get the current User', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
      it('Should throw error if no Headers are sent', () => {
        return pactum.spec().get('/users/me').expectStatus(401);
      });
    });
  });
});
