import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TrainingPlansService } from './training-plans.service';
import { CreateTrainingPlanDto } from './dto/create-training-plan.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';


@Controller('training-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrainingPlansController {
    constructor(private readonly trainingPlansService: TrainingPlansService) {}

    @Post()
    @Roles(UserRole.COACH)
    async create(@Body() dto: CreateTrainingPlanDto){
        return this.trainingPlansService.create(dto);
    }

    @Get('program/:programId')
    findByProgram(@Param('programId') programId : string){
        return this.trainingPlansService.findByProgram(programId);
    }

    @Delete(':id')
    @Roles(UserRole.COACH)
    remove(@Param('id') id: string){
        return this.trainingPlansService.remove(id);
    }
}
