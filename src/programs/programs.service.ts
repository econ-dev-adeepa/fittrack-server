import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program, ProgramStatus } from './program.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramStatusDto } from './dto/update-program.dto';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private programsRepository: Repository<Program>,
  ) {}

  // FR-3.03 Coach creates a program
  async create(createProgramDto: CreateProgramDto, coachId: string): Promise<Program> {
    const program = this.programsRepository.create({
      ...createProgramDto,
      coachId,
      status: ProgramStatus.DRAFT,
    });
    return this.programsRepository.save(program);
  }

  // FR-3.03 Coach submits program for approval
  async submitForApproval(id: string, coachId: string): Promise<Program> {
    const program = await this.programsRepository.findOne({ where: { id } });
    if (!program) throw new NotFoundException(`Program #${id} not found`);
    if (program.coachId !== coachId) throw new ForbiddenException('Not your program');
    program.status = ProgramStatus.PENDING_APPROVAL;
    return this.programsRepository.save(program);
  }

  // Gym Admin views pending programs
  async findPendingByGym(gymId: string): Promise<Program[]> {
    return this.programsRepository.find({
      where: { gymId, status: ProgramStatus.PENDING_APPROVAL },
    });
  }

  // Gym Admin approves or rejects a program
  async updateStatus(id: string, updateDto: UpdateProgramStatusDto): Promise<Program> {
    const program = await this.programsRepository.findOne({ where: { id } });
    if (!program) throw new NotFoundException(`Program #${id} not found`);
    program.status = updateDto.status;
    return this.programsRepository.save(program);
  }

  // Approved programs visible to all gym members
  async findApprovedByGym(gymId: string): Promise<Program[]> {
    return this.programsRepository.find({
      where: { gymId, status: ProgramStatus.APPROVED },
    });
  }

  // Coach views their own programs
  async findByCoach(coachId: string): Promise<Program[]> {
    return this.programsRepository.find({ where: { coachId } });
  }
}