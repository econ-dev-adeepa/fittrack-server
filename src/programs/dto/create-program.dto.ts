import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  gymId: string;

  @IsString()
  @IsOptional()
  schedule?: string;

  @IsNumber()
  @IsOptional()
  sessionsPerWeek?: number;

  @IsNumber()
  @IsOptional()
  sessionDuration?: number;

  @IsNumber()
  @IsOptional()
  totalSlots?: number;

  @IsString()
  @IsOptional()
  difficulty?: string;

  @IsNumber()
  @IsOptional()
  programDuration?: number;
}