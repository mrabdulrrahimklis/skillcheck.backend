import { ApiProperty, PartialType, OmitType } from "@nestjs/swagger";
import { CreateCredentialsDto, CreateUserDto } from "./create-user.dto";
import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class UpdateCredentialsDto extends PartialType(CreateCredentialsDto){}

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['Credentials']))  {
  @ApiProperty({type: Number})
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  email: string

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  email_confirmed: boolean

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  is_admin: boolean

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  credentials_id? : number

  @ApiProperty({type: () => UpdateCredentialsDto})
  @Type(() => UpdateCredentialsDto)
  @IsOptional()
  Credentials: UpdateCredentialsDto
}