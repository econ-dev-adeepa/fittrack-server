import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Gym } from './gym.entity';
import { Repository } from 'typeorm';
import CreateGymDto from './dto/create-gym.dto';
import { Program, ProgramStatus} from 'src/programs/program.entity';
import { GymAffiliation, AffiliationStatus, AffiliationType } from 'src/affiliations/gym-affiliation.entity';

@Injectable()
export class GymsService {
    constructor(
        @InjectRepository(Gym)
        private gymsRepository: Repository<Gym>,
        
        @InjectRepository(Program)
        private programsRepository: Repository<Program>,

        @InjectRepository(GymAffiliation)
        private affiliationsRepository: Repository<GymAffiliation>,
    ) {}

    async create(createGymDto: CreateGymDto, adminId: string): Promise<Gym> {
        const gym = this.gymsRepository.create({
            name: createGymDto.name,
            location: createGymDto.location,
            description: createGymDto.description,
            phone: createGymDto.phone,
            createdByAdminId: adminId,
            operationalDays: createGymDto.operationalDays,
            openTime: createGymDto.openTime,
            closeTime: createGymDto.closeTime,
            capacity: createGymDto.capacity,
        })

        return this.gymsRepository.save(gym);
    }

    async findAll(): Promise<Gym[]> {
        return this.gymsRepository.find();
    }

    async findOwnedGyms(adminId: string): Promise<Gym[]> {
        return this.gymsRepository.find({ where: { createdByAdminId: adminId } });
    }

    async getDashboard(gymId: string) {
    const gym = await this.gymsRepository.findOne({ where: { id: gymId } });
    if (!gym) throw new NotFoundException(`Gym #${gymId} not found`);

    // Approved programs
    const approvedPrograms = await this.programsRepository.find({
      where: { gymId, status: ProgramStatus.APPROVED },
    });

    // Pending programs
    const pendingPrograms = await this.programsRepository.find({
      where: { gymId, status: ProgramStatus.PENDING_APPROVAL },
    });

    // Approved coaches
    const approvedCoaches = await this.affiliationsRepository.find({
      where: { gymId, type: AffiliationType.COACH, status: AffiliationStatus.APPROVED },
    });

    // Approved customers
    const approvedCustomers = await this.affiliationsRepository.find({
      where: { gymId, type: AffiliationType.CUSTOMER, status: AffiliationStatus.APPROVED },
    });

    // Pending coaches
    const pendingCoaches = await this.affiliationsRepository.find({
      where: { gymId, type: AffiliationType.COACH, status: AffiliationStatus.PENDING },
    });

    // Pending customers
    const pendingCustomers = await this.affiliationsRepository.find({
      where: { gymId, type: AffiliationType.CUSTOMER, status: AffiliationStatus.PENDING },
    });

    // Total used slots across approved programs
    const totalUsedSlots = approvedPrograms.reduce((sum, p) => sum + (p.totalSlots || 0), 0);
    const availableCapacity = (gym.capacity || 0) - totalUsedSlots;

    // Schedule by day — group programs by day
    const scheduleByDay: Record<string, Array<{
      title: string;
      schedule: string;
      slots: number;
      coachId: string;
    }>> = {};

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    days.forEach(day => { scheduleByDay[day] = []; });

    for (const prog of approvedPrograms) {
      if (!prog.schedule) continue;
      const parts = prog.schedule.split(' ');
      const progDays = parts[0]?.split('/') || [];
      const progTime = parts.slice(1).join(' ');
      for (const day of progDays) {
        if (scheduleByDay[day] !== undefined) {
          scheduleByDay[day].push({
            title: prog.title,
            schedule: progTime,
            slots: prog.totalSlots || 0,
            coachId: prog.coachId,
          });
        }
      }
    }

    // Remove empty days
    const activeSchedule = Object.fromEntries(
      Object.entries(scheduleByDay).filter(([_, programs]) => programs.length > 0)
    );

    return {
      gym: {
        id: gym.id,
        name: gym.name,
        capacity: gym.capacity,
        operationalDays: gym.operationalDays,
        openTime: gym.openTime,
        closeTime: gym.closeTime,
      },
      stats: {
        totalCapacity: gym.capacity || 0,
        usedSlots: totalUsedSlots,
        availableSlots: availableCapacity,
        approvedPrograms: approvedPrograms.length,
        pendingPrograms: pendingPrograms.length,
        approvedCoaches: approvedCoaches.length,
        approvedCustomers: approvedCustomers.length,
        pendingCoaches: pendingCoaches.length,
        pendingCustomers: pendingCustomers.length,
      },
      scheduleByDay: activeSchedule,
    };
  }
}
