import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingPlan } from './training-plan.entity';
import { CreateTrainingPlanDto } from './dto/create-training-plan.dto';

@Injectable()
export class TrainingPlansService {
  constructor(
    @InjectRepository(TrainingPlan)
    private trainingPlansRepository: Repository<TrainingPlan>,
  ) {}

  async create(dto: CreateTrainingPlanDto): Promise<TrainingPlan> {
    const plan = this.trainingPlansRepository.create(dto);
    return this.trainingPlansRepository.save(plan);
  }

  async findByProgram(programId: string): Promise<TrainingPlan[]> {
    return this.trainingPlansRepository.find({ where: { programId } });
  }

  async remove(id: string): Promise<void> {
    const plan = await this.trainingPlansRepository.findOne({ where: { id } });
    if (!plan) throw new NotFoundException(`Training plan #${id} not found`);
    await this.trainingPlansRepository.remove(plan);
  }
}