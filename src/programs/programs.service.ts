import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program, ProgramStatus } from './program.entity';
import { Gym } from '../gyms/gym.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramStatusDto } from './dto/update-program.dto';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private programsRepository: Repository<Program>,

    @InjectRepository(Gym)
    private gymsRepository: Repository<Gym>,
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

  // Gym Admin rejects with proposal
  async rejectWithProposal(id: string, dto: {
    rejectionReason: string;
    proposedDays: string;
    proposedTime: string;
    proposedSlots: number;
  }): Promise<Program> {
    const program = await this.programsRepository.findOne({ where: { id } });
    if (!program) throw new NotFoundException(`Program #${id} not found`);
    program.status = ProgramStatus.REJECTED_WITH_PROPOSAL;
    program.rejectionReason = dto.rejectionReason;
    program.proposedDays = dto.proposedDays;
    program.proposedTime = dto.proposedTime;
    program.proposedSlots = dto.proposedSlots;
    return this.programsRepository.save(program);
  }

  // Coach responds to proposal
  async respondToProposal(id: string, coachId: string, accept: boolean): Promise<Program> {
    const program = await this.programsRepository.findOne({ where: { id } });
    if (!program) throw new NotFoundException(`Program #${id} not found`);
    if (program.coachId !== coachId) throw new ForbiddenException('Not your program');
    if (program.status !== ProgramStatus.REJECTED_WITH_PROPOSAL) {
      throw new ForbiddenException('No proposal to respond to');
    }

    if (accept) {
      const formattedDays = program.proposedDays?.replace(/,/g, '/') || '';

      // Extract original duration from existing schedule
      // Original schedule format: "Mon/Wed/Fri 06:00 AM - 09:00 AM"
      const originalSchedule = program.schedule || '';
      const originalParts = originalSchedule.split(' ');
      // Get start and end time from original: parts[1]="06:00" parts[2]="AM" parts[3]="-" parts[4]="09:00" parts[5]="AM"
      const hasEndTime = originalParts.length >= 6 && originalParts[3] === '-';

      let newSchedule: string;

      if (hasEndTime) {
        // Calculate duration from original schedule
        const originalStart = `${originalParts[1]} ${originalParts[2]}`; // "06:00 AM"
        const originalEnd = `${originalParts[4]} ${originalParts[5]}`;   // "09:00 AM"

        // Parse to minutes
        const parseToMinutes = (t: string): number => {
          const [timePart, period] = t.split(' ');
          let [h, m] = timePart.split(':').map(Number);
          if (period === 'PM' && h !== 12) h += 12;
          if (period === 'AM' && h === 12) h = 0;
          return h * 60 + m;
        };

        const startMins = parseToMinutes(originalStart);
        const endMins = parseToMinutes(originalEnd);
        const durationMins = endMins - startMins;

        // Calculate new end time from proposed start + original duration
        const calculateEndTime = (startTime: string, durationMins: number): string => {
          const parseToMinutes = (t: string): number => {
            const [timePart, period] = t.split(' ');
            let [h, m] = timePart.split(':').map(Number);
            if (period === 'PM' && h !== 12) h += 12;
            if (period === 'AM' && h === 12) h = 0;
            return h * 60 + m;
          };
          const totalMins = parseToMinutes(startTime) + durationMins;
          let endH = Math.floor(totalMins / 60) % 24;
          const endM = totalMins % 60;
          const period = endH >= 12 ? 'PM' : 'AM';
          if (endH > 12) endH -= 12;
          if (endH === 0) endH = 12;
          return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')} ${period}`;
        };

        const newEndTime = calculateEndTime(program.proposedTime, durationMins);
        newSchedule = `${formattedDays} ${program.proposedTime} - ${newEndTime}`;
      } else {
        // No end time in original — just use proposed time as is
        newSchedule = `${formattedDays} ${program.proposedTime}`;
      }

      program.schedule = newSchedule;
      program.totalSlots = program.proposedSlots;
      program.status = ProgramStatus.APPROVED;
    } else {
      program.status = ProgramStatus.REJECTED;
    }

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

  // Conflict detection
  async checkConflicts(gymId: string, days: string, time: string, slots: number): Promise<{
    hasConflict: boolean;
    warnings: string[];
  }> {
    const warnings: string[] = [];

    const gym = await this.gymsRepository.findOne({ where: { id: gymId } });
    if (!gym) return { hasConflict: true, warnings: ['Gym not found'] };

    // 1. Check operational days
    const requestedDays = days.split(',').map(d => d.trim());
    const gymDays = gym.operationalDays?.split(',').map(d => d.trim()) || [];
    const invalidDays = requestedDays.filter(d => !gymDays.includes(d));
    if (invalidDays.length > 0) {
      warnings.push(`Gym is not operational on: ${invalidDays.join(', ')}`);
    }

    // 2. Check operational time
    if (gym.openTime && gym.closeTime) {
      // Convert "06:00 AM" to 24hr for comparison
      const parseTime = (t: string) => {
        const [time, period] = t.split(' ');
        let [h] = time.split(':').map(Number);
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return h;
      };
      const reqHour = parseTime(time);
      const [openHour] = gym.openTime.split(':').map(Number);
      const [closeHour] = gym.closeTime.split(':').map(Number);
      if (reqHour < openHour || reqHour >= closeHour) {
        warnings.push(`Gym operates ${gym.openTime} - ${gym.closeTime}. Requested time ${time} is outside operational hours.`);
      }
    }

    // 3. Check slot conflicts with approved programs
    const approvedPrograms = await this.programsRepository.find({
      where: { gymId, status: ProgramStatus.APPROVED },
    });

    let usedSlotsAtTime = 0;
    for (const prog of approvedPrograms) {
      if (!prog.schedule) continue;
      const parts = prog.schedule.split(' ');
      const progDays = parts[0]?.split('/') || [];
      // const progTime = parts.slice(1).join(' ');
      const progTime = parts[1] + ' ' + parts[2];
      const hasOverlappingDay = requestedDays.some(d => progDays.includes(d));
      const hasSameTime = progTime === time;
      if (hasOverlappingDay && hasSameTime) {
        usedSlotsAtTime += prog.totalSlots || 0;
        warnings.push(`Conflict with "${prog.title}" on overlapping days at ${time}`);
      }
    }

    // 4. Check capacity
    if (gym.capacity) {
      const totalAfterApproval = usedSlotsAtTime + slots;
      if (totalAfterApproval > gym.capacity) {
        warnings.push(`Capacity exceeded. Gym capacity: ${gym.capacity}, Already used: ${usedSlotsAtTime}, Requested: ${slots}, Total would be: ${totalAfterApproval}`);
      }
    }

    return { hasConflict: warnings.length > 0, warnings };
  }

  async findOne(id: string): Promise<Program> {
    const program = await this.programsRepository.findOne({ where: { id } });
    if (!program) throw new NotFoundException(`Program #${id} not found`);
    return program;
  }
}