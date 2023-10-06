import { IsDateString, IsOptional } from "class-validator";

export class CommonFindAttributesDto {
  @IsOptional()
  limit?: number;

  @IsOptional()
  offset?: number;

  @IsOptional()
  @IsDateString()
  updatedSince?: number;
}

