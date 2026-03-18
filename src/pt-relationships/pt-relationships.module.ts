import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PTRelationshipsService } from './pt-relationships.service';
import { PTRelationshipsController } from './pt-relationships.controller';
import { PTRelationship } from './pt-relationship.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PTRelationship])],
  controllers: [PTRelationshipsController],
  providers: [PTRelationshipsService],
  exports: [PTRelationshipsService],
})
export class PTRelationshipsModule {}