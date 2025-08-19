import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({ description: 'The title of the announcement', example: 'New Government Job Posting' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The content of the announcement', example: 'We are hiring for a new position...' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
