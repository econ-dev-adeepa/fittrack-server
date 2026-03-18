import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AffiliationsService } from './affiliations.service';
import { AffiliationsController } from './affiliations.controller';
import { GymAffiliation } from './gym-affiliation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GymAffiliation])],
  controllers: [AffiliationsController],
  providers: [AffiliationsService],
  exports: [AffiliationsService],
})
export class AffiliationsModule {}