import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateTrainingPlanDto {
  @IsString()
  @IsNotEmpty()
  programId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

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