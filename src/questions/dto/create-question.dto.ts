import { IsNotEmpty, IsString, IsInt, IsArray, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class CreateChoiceDto {
  @IsString()
  @IsNotEmpty()
  choice_text: string;

  @IsNotEmpty()
  is_correct: boolean;
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  question_text: string;

  @IsInt()
  subject_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChoiceDto)
  choices: CreateChoiceDto[];

  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard'])
  difficulty?: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  position_ids?: number[];
}
