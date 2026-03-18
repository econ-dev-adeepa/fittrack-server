import { IsEnum } from 'class-validator';
import { PTStatus } from '../pt-relationship.entity';

export class UpdatePTStatusDto {
  @IsEnum(PTStatus)
  status: PTStatus;
}