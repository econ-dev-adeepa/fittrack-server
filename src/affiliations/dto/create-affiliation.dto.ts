import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { AffiliationType } from '../gym-affiliation.entity';

export class CreateAffiliationDto {
  @IsString()
  @IsNotEmpty()
  gymId: string;

  @IsEnum(AffiliationType)
  type: AffiliationType;
}
