import { ApiProperty } from "@nestjs/swagger";

export class DeleteUserDto {
  @ApiProperty({type: Number})
  id: number;
}
