import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Gym } from './gym.entity';
import { Repository } from 'typeorm';
import CreateGymDto from './dto/create-gym.dto';

@Injectable()
export class GymsService {
    constructor(
        @InjectRepository(Gym)
        private gymsRepository: Repository<Gym>,
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
}
