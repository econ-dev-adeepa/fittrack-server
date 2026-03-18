import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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
}