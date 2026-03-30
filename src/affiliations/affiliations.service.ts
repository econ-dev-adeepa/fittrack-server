import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GymAffiliation, AffiliationStatus, AffiliationType } from './gym-affiliation.entity';
import { CreateAffiliationDto } from './dto/create-affiliation.dto';
import { UpdateAffiliationDto } from './dto/update-affiliation.dto';

@Injectable()
export class AffiliationsService {
  constructor(
    @InjectRepository(GymAffiliation)
    private affiliationsRepository: Repository<GymAffiliation>,
  ) {}

  // Coach or Customer submits request to join a gym
  async create(createAffiliationDto: CreateAffiliationDto, userId: string): Promise<GymAffiliation> {
    const existing = await this.affiliationsRepository.findOne({
      where: {
        userId,
        gymId: createAffiliationDto.gymId,
        type: createAffiliationDto.type,
      },
    });
    if (existing) throw new ConflictException('Affiliation request already exists');

    const affiliation = this.affiliationsRepository.create({
      ...createAffiliationDto,
      userId,
      status: AffiliationStatus.PENDING,
    });
    return this.affiliationsRepository.save(affiliation);
  }

  // Get approved affiliations by type in a gym
  async findActiveByType(gymId: string, type: AffiliationType): Promise<GymAffiliation[]> {
    return this.affiliationsRepository.find({
      where: {
        gymId,
        type,
        status: AffiliationStatus.APPROVED,
      },
    });
  }

  // Gym Admin views pending requests by type
  async findPendingByType(gymId: string, type: AffiliationType): Promise<GymAffiliation[]> {
    return this.affiliationsRepository.find({
      where: { gymId, type, status: AffiliationStatus.PENDING },
    });
  }

  // Gym Admin approves or rejects
  async updateStatus(id: string, updateDto: UpdateAffiliationDto): Promise<GymAffiliation> {
    const affiliation = await this.affiliationsRepository.findOne({ where: { id } });
    if (!affiliation) throw new NotFoundException(`Affiliation #${id} not found`);
    affiliation.status = updateDto.status;
    return this.affiliationsRepository.save(affiliation);
  }

  // Check if user is approved in a gym
  async isApproved(userId: string, gymId: string): Promise<boolean> {
    const affiliation = await this.affiliationsRepository.findOne({
      where: { userId, gymId, status: AffiliationStatus.APPROVED },
    });
    return !!affiliation;
  }

  // Get all gyms a user is affiliated with
  async findByUser(userId: string): Promise<GymAffiliation[]> {
    return this.affiliationsRepository.find({ where: { userId } });
  }
}