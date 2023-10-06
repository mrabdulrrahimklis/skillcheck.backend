import { Credentials } from "../entities/credential.entity";
import { IsOptional, IsString } from "class-validator";
import { CommonFindAttributesDto } from "../../common/dto/common-find-attributes.dto";
import { PartialType } from "@nestjs/swagger";

export class FindUserDto extends PartialType(CommonFindAttributesDto) {
  @IsOptional()
  id?: number[]

  @IsOptional()
  credentials?: Credentials

  @IsOptional()
  email?: string

  @IsOptional()
  name?: string
}