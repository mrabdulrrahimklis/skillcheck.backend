import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { EndpointIsPublic } from '../common/decorators/publicEndpoint.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Access Token')
  @ApiOperation({
    summary: 'Get List of users including filter query',
  })
  @Get()
  async find(@Query() findUserDto: FindUserDto, @Req() req: Request) {
    return this.usersService.find(findUserDto, false);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Access Token')
  @ApiOperation({
    summary: 'Update user role',
  })
  @Get(':id')
  async findUnique(@Param('id') id: number, @Req() req: Request) {
    return this.usersService.findUnique({ id: +id }, true);
  }

  @EndpointIsPublic()
  @ApiOperation({
    summary: 'Create user',
  })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Access Token')
  @ApiOperation({
    summary: 'Update user if exist IF has not ben deleted previously',
  })
  @Patch()
  async update(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    return this.usersService.update(updateUserDto, req);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Access Token')
  @ApiOperation({
    summary: 'Marks user as deleted and deleted Credentials but user is still in database like soft deleted user',
  })
  @Delete()
  async delete(@Body() deleteUserDto: DeleteUserDto, @Req() req: Request) {
    return this.usersService.delete(deleteUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Access Token')
  @ApiOperation({
    summary: 'Validation token provided in request',
  })
  @Post('validate')
  async userValidateToken(@Req() req: Request) {
    const [_, token] = req.headers.authorization.split(' ');

    return this.usersService.validateToken(token);
  }

  @EndpointIsPublic()
  @ApiOperation({
    summary: 'Authentication with Email and Password get boolean is user authenticated',
  })
  @Post('authenticate')
  async userAuthenticate(@Body() authenticateUserDto: AuthenticateUserDto) {
    return this.usersService.authenticate(authenticateUserDto);
  }

  @Post('token')
  async userGetToken(@Body() authenticateUserDto: AuthenticateUserDto) {
    console.log('auttt', authenticateUserDto);

    return this.usersService.authenticateAndGetJwtToken(authenticateUserDto);
  }
}
