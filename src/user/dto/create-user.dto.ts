import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateCredentialsDto {
  @ApiProperty()
  @IsNotEmpty()
  hash: string
}

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  email: string

  @ApiProperty()
  @IsBoolean()
  email_confirmed: boolean

  @ApiProperty()
  @IsBoolean()
  is_admin: boolean

  @ApiProperty()
  roles: string[]

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  credentials_id? : number

  @ApiProperty({type: () => CreateCredentialsDto})
  @Type(() => CreateCredentialsDto)
  Credentials: CreateCredentialsDto
}
