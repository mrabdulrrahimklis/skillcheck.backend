import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { Request } from 'express';
import { hashPassword, hashPasswordSync, matchHashedPassword } from '../common/utils/password';
import { PrismaService } from '../prisma.services';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface Decoded {
  sub: number;
  name: string;
  email: string;
  mail_confirmed: boolean;
  is_admin: boolean;
  iat: number;
  exp: number;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  /**
   * Finds users with matching fields
   *
   * @param findUserDto
   * @returns User[]
   */
  async find(findUserDto: FindUserDto, includeSofDeleted = false): Promise<User[]> {
    const take = findUserDto?.limit !== undefined ? +findUserDto.limit : 10;
    const skip = findUserDto?.offset !== undefined ? +findUserDto.offset : 0;
    // @ts-ignore
    const ids: number[] = findUserDto?.id ? JSON.parse(findUserDto.id) : undefined;
    const updatedSince = findUserDto?.updatedSince ? new Date(findUserDto.updatedSince) : undefined;

    return this.prisma.user.findMany({
      take,
      skip,
      where: {
        email: {
          equals: findUserDto?.email,
        },
        name: {
          contains: findUserDto?.name,
        },
        id: {
          in: ids,
        },
        updated_at: {
          gte: updatedSince,
        },
        credentials_id: {
          equals: findUserDto?.credentials?.id,
        },
        deleted: {
          equals: includeSofDeleted,
        },
      },
      include: { Credentials: true },
    });
  }

  /**
   * Finds single UserEntity by id, name or email
   *
   * @param whereUnique
   * @returns User
   */
  async findUnique(whereUnique: Prisma.UserWhereUniqueInput, includeCredentials = false) {
    const user = await this.prisma.user.findUnique({
      where: whereUnique,
      include: { Credentials: includeCredentials },
    });

    if (user) {
      return user;
    } else {
      throw new HttpException('User does not exist!', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Creates a new user with credentials
   *
   * @param createUserDto
   * @returns result of create
   */
  async create(createUserDto: CreateUserDto) {
    const { Credentials, ...rest } = createUserDto;

    const hash = await hashPassword(Credentials.hash);
    const credentials = await this.prisma.credentials.create({ data: { hash } });

    try {
      return this.prisma.user.create({
        data: {
          ...rest,
          credentials_id: credentials.id,
        },
      });
    } catch (e) {
      this.prisma.credentials.delete({ where: { id: credentials.id } });

      throw new HttpException('Bad request.', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Updates a user unless it does not exist or has been marked as deleted before
   *
   * @param updateUserDto
   * @returns result of update
   */
  async update(updateUserDto: UpdateUserDto, req: Request) {
    const [_, token] = req.headers.authorization.split(' ');
    const decoded: any = this.jwtService.decode(token);

    if (decoded.is_admin || decoded.id === updateUserDto.id) {
      try {
        const { Credentials: updateCredentials, credentials_id, id, is_admin, ...rest } = updateUserDto;

        const prevCredentials = await this.prisma.credentials.findUnique({ where: { id: credentials_id } });

        const isMatch = await matchHashedPassword(prevCredentials.hash, updateCredentials.hash);

        const userToUpdate = this.prisma.user.findUnique({ where: { id: updateUserDto.id } });

        if (!isMatch) {
          const newHash = hashPasswordSync(updateCredentials.hash);

          await this.prisma.credentials.update({
            where: { id: prevCredentials.id },
            data: {
              hash: newHash,
            },
          });
        }

        if (userToUpdate.Credentials !== null) {
          return this.prisma.user.update({
            where: {
              id: updateUserDto.id,
            },
            data: {
              ...rest,
              is_admin,
            },
            include: { Credentials: true },
          });
        } else {
          throw new HttpException('User is deleted.', HttpStatus.FORBIDDEN);
        }
      } catch (e) {
        throw new HttpException('Bad request.', HttpStatus.BAD_REQUEST);
      }
    } else {
      throw new HttpException('You are not allowed to make this request.', HttpStatus.FORBIDDEN);
    }
  }

  /**
   * Deletes a user
   * Function does not actually remove the user from database but instead marks them as deleted by:
   * - removing the corresponding `credentials` row from your db
   * - changing the name to DELETED_USER_NAME constant (default: `(deleted)`)
   * - setting email to NULL
   *
   * @param deleteUserDto
   * @returns results of users and credentials table modification
   */
  async delete(deleteUserDto: DeleteUserDto) {
    const { id } = deleteUserDto;

    console.log('id', id);

    const user = await this.prisma.user.findUnique({ where: { id } });
    await this.prisma.user.update({
      where: { id: user.id },
      data: { ...user, email: null, name: 'DELETED_USER_NAME', deleted: true },
    });

    await this.prisma.credentials.delete({ where: { id: user.credentials_id } });

    return {
      message: 'User is deleted!',
    };
  }

  /**
   * Authenticates a user and returns a JWT token
   *
   * @param authenticateUserDto email and password for authentication
   * @returns a JWT token
   */
  async authenticateAndGetJwtToken(authenticateUserDto: AuthenticateUserDto) {
    const { email, password } = authenticateUserDto;
    const user = await this.prisma.user.findUnique({ where: { email }, include: { Credentials: true } });

    const isMatch = await matchHashedPassword(password, user.Credentials.hash);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload = {
      sub: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      mail_confirmed: user.email_confirmed,
      is_admin: user.is_admin,
    };

    return {
      ...user,
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  /**
   * Authenticates a user
   *
   * @param authenticateUserDto email and password for authentication
   * @returns true or false
   */
  async authenticate(authenticateUserDto: AuthenticateUserDto) {
    const { email, password } = authenticateUserDto;
    const user = await this.prisma.user.findUnique({ where: { email }, include: { Credentials: true } });

    return matchHashedPassword(password, user.Credentials.hash);
  }

  /**
   * Validates a JWT token
   *
   * @param token a JWT token
   * @returns the decoded token if valid
   */
  async validateToken(token: string) {
    if (this.jwtService.verify(token)) {
      return this.jwtService.decode(token);
    } else {
      return new Error('Token is not valid.');
    }
  }
}
