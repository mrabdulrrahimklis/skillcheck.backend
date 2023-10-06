import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { PrismaService } from '../prisma.services';
import { UserService } from './user.service';

const matchHashedPasswordPath = '../common/utils/password'
const mockVar = jest.fn()
const matchHashedPasswordVar = jest.fn().mockImplementation((data) => mockVar(data))
jest.doMock(matchHashedPasswordPath, () => {
  return {
    matchHashedPassword: matchHashedPasswordVar
  }
})

describe('UserService', () => {
  let userService;
  let prismaServiceMock = { user: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn() } };

  const authUserDTO = { email: 'jane@doe.com', password: "JaneJane" };
  const mockUser = {
    "name": "Jane Doe",
    "email": "jane@doe.com",
    "email_confirmed": false,
    "is_admin": false,
    "Credentials": {
      "hash": "JaneJane"
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: 'JWT_SECRET',
          signOptions: {
            expiresIn: '1year',
            algorithm: 'HS256',
          },
        }),
      ],

      providers: [UserService, { provide: PrismaService, useValue: prismaServiceMock }, JwtStrategy, ConfigService],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it("should get credentials", async () => {
    prismaServiceMock.user.findUnique.mockResolvedValue(mockUser)
    await userService.authenticate(authUserDTO)

    expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({ where: { email: authUserDTO.email }, include: { Credentials: true }});
  });

  it("should find all users with offser and limit", async () => {
    const finUserDTO = { limit: 10, offset: 0, email: 'jane@doe.com', name: 'Jane', id: [2, 3]}
    await userService.find()

    expect(prismaServiceMock.user.findMany).toHaveBeenCalled();
    expect(prismaServiceMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 10, skip: 0 }));
  });

  it("should get unique user", async () => {
    const finUserDTO = { id:  1,
      email: "jane@doe.com",
      credentials_id: 1
    }
    await userService.findUnique(finUserDTO)

    expect(prismaServiceMock.user.findUnique).toHaveBeenCalled();
    expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { email: finUserDTO.email } }));
  });

});
