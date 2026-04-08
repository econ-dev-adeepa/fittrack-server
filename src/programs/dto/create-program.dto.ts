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
  totalSlots?: number;
  
  // @IsNumber()
  // @IsOptional()
  // sessionsPerWeek?: number;

  // @IsNumber()
  // @IsOptional()
  // sessionDuration?: number;


  // @IsString()
  // @IsOptional()
  // difficulty?: string;

  // @IsNumber()
  // @IsOptional()
  // programDuration?: number;
}