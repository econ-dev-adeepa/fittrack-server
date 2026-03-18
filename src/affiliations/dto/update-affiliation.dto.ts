import { IsEnum } from 'class-validator';
import { AffiliationStatus } from '../gym-affiliation.entity';

export class UpdateAffiliationDto {
  @IsEnum(AffiliationStatus)
  status: AffiliationStatus;
}