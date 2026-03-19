import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePTRequestDto {
  @IsString()
  @IsNotEmpty()
  coachId: string;

  @IsString()
  @IsNotEmpty()
  gymId: string;

  @IsString()
  @IsOptional()
  preferredDays?: string;

  @IsString()
  @IsOptional()
  preferredTime?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}