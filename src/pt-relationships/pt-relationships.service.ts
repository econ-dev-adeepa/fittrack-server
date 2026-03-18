import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PTRelationship, PTStatus } from './pt-relationship.entity';
import { CreatePTRequestDto } from './dto/create-pt.dto';
import { UpdatePTStatusDto } from './dto/update-pt.dto';

@Injectable()
export class PTRelationshipsService {
  constructor(
    @InjectRepository(PTRelationship)
    private ptRepository: Repository<PTRelationship>,
  ) {}

  // FR-4.04 Customer sends PT request to a coach
  async create(createPTDto: CreatePTRequestDto, customerId: string): Promise<PTRelationship> {
    const existing = await this.ptRepository.findOne({
      where: {
        customerId,
        coachId: createPTDto.coachId,
        gymId: createPTDto.gymId,
      },
    });
    if (existing) throw new ConflictException('PT request already exists');

    const ptRequest = this.ptRepository.create({
      ...createPTDto,
      customerId,
      status: PTStatus.REQUESTED,
    });
    return this.ptRepository.save(ptRequest);
  }

  // FR-3.04 Coach views incoming PT requests
  async findRequestsByCoach(coachId: string): Promise<PTRelationship[]> {
    return this.ptRepository.find({ where: { coachId } });
  }

  // FR-3.04 Coach approves → COACH_APPROVED or denies → DENIED
  async updateStatusByCoach(id: string, coachId: string, updateDto: UpdatePTStatusDto): Promise<PTRelationship> {
    const ptRequest = await this.ptRepository.findOne({ where: { id } });
    if (!ptRequest) throw new NotFoundException(`PT request #${id} not found`);
    if (ptRequest.coachId !== coachId) throw new ForbiddenException('Not your PT request');

    if (updateDto.status === PTStatus.ACTIVE) {
      throw new ForbiddenException('Coach cannot directly activate. Gym Admin must approve.');
    }

    ptRequest.status = updateDto.status;
    return this.ptRepository.save(ptRequest);
  }

  // Gym Admin views all coach-approved PT requests for their gym
  async findCoachApprovedByGym(gymId: string): Promise<PTRelationship[]> {
    return this.ptRepository.find({
      where: { gymId, status: PTStatus.COACH_APPROVED },
    });
  }

  // Gym Admin final approval → ACTIVE or DENIED
  async updateStatusByGymAdmin(id: string, updateDto: UpdatePTStatusDto): Promise<PTRelationship> {
    const ptRequest = await this.ptRepository.findOne({ where: { id } });
    if (!ptRequest) throw new NotFoundException(`PT request #${id} not found`);

    if (ptRequest.status !== PTStatus.COACH_APPROVED) {
      throw new ForbiddenException('Coach must approve before Gym Admin can activate');
    }

    ptRequest.status = updateDto.status;
    return this.ptRepository.save(ptRequest);
  }

  // FR-3.05 Coach views their active clients
  async findActiveClients(coachId: string): Promise<PTRelationship[]> {
    return this.ptRepository.find({
      where: { coachId, status: PTStatus.ACTIVE },
    });
  }

  // FR-4.05 Customer views their PT request status
  async findByCustomer(customerId: string): Promise<PTRelationship[]> {
    return this.ptRepository.find({ where: { customerId } });
  }

  // FR-4.05 Customer views their active trainer
  async findActiveTrainer(customerId: string): Promise<PTRelationship | null> {
    return this.ptRepository.findOne({
      where: { customerId, status: PTStatus.ACTIVE },
    });
  }
}