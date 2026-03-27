import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { GymsService } from './gyms.service';
import CreateGymDto from './dto/create-gym.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/user.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('gyms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GymsController {
    constructor(private readonly gymService: GymsService) {}

    @Get()
    findAll() {
        return this.gymService.findAll();
    }

    @Post()
    @Roles(UserRole.GYM_ADMIN)
    create(@Body() createGymDto: CreateGymDto, @Request() req: any) {
        const adminId = req.user.sub;
        return this.gymService.create(createGymDto, adminId);
    }
}
