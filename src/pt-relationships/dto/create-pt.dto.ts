import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePTRequestDto {
  @IsString()
  @IsNotEmpty()
  coachId: string;

  @IsString()
  @IsNotEmpty()
  gymId: string;
}