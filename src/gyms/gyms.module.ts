import { Module } from '@nestjs/common';
import { GymsController } from './gyms.controller';
import { GymsService } from './gyms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gym } from './gym.entity';
import { Program } from 'src/programs/program.entity';
import { GymAffiliation } from 'src/affiliations/gym-affiliation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gym, Program, GymAffiliation])],
  controllers: [GymsController],
  providers: [GymsService],
  exports: [GymsService],
})
export class GymsModule {}
