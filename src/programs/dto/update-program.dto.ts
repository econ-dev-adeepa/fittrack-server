import { IsEnum } from 'class-validator';
import { ProgramStatus } from '../program.entity';

export class UpdateProgramStatusDto {
  @IsEnum(ProgramStatus)
  status: ProgramStatus;
}