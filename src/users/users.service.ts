import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async findUserById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    async createOrUpdate(user: Partial<User>): Promise<User> {
        const existing = await this.userRepository.findOne({ where: { id: user.id } });
        if (existing) {
            const updated = this.userRepository.merge(existing, user);
            return this.userRepository.save(updated);
        } else {
            const newUser = this.userRepository.create(user);
            return this.userRepository.save(newUser);
        }
    }
}
