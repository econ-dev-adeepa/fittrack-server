import { Body, Controller, Get, Param, Post, Query, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
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
    findAll(@Request() req: any, @Query('is_admin') is_admin?: boolean) {
        if (is_admin === undefined) is_admin = false;
        if (!is_admin) {
            return this.gymService.findAll();
        }

        if (!req.user || req.user.user_role !== UserRole.GYM_ADMIN) {
            throw new UnauthorizedException('You do not have permission to access this resource');
        }

        return this.gymService.findOwnedGyms(req.user.sub);
    }

    @Post()
    @Roles(UserRole.GYM_ADMIN)
    create(@Body() createGymDto: CreateGymDto, @Request() req: any) {
        const adminId = req.user.sub;
        return this.gymService.create(createGymDto, adminId);
    }


    @Get(':gymId/dashboard')
    @Roles(UserRole.GYM_ADMIN)
    getDashboard(@Param('gymId') gymId: string) {
    return this.gymService.getDashboard(gymId);
    }
}
