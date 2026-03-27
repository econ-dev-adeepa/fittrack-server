import { Module } from '@nestjs/common';
import { GymsController } from './gyms.controller';
import { GymsService } from './gyms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gym } from './gym.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gym])],
  controllers: [GymsController],
  providers: [GymsService]
})
export class GymsModule {}
