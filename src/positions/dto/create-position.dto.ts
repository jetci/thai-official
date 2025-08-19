import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePositionDto {
  @ApiProperty({
    description: 'The name of the position',
    example: 'นักวิเคราะห์นโยบายและแผน',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
