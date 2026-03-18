import {
  Controller, Get, Post, Patch, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramStatusDto } from './dto/update-program.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('programs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  // FR-3.03 Coach creates a program
  @Post()
  @Roles(UserRole.COACH)
  create(@Body() createProgramDto: CreateProgramDto, @Request() req: any) {
    return this.programsService.create(createProgramDto, req.user.sub);
  }

  // FR-3.03 Coach submits program for approval
  @Patch(':id/submit')
  @Roles(UserRole.COACH)
  submit(@Param('id') id: string, @Request() req: any) {
    return this.programsService.submitForApproval(id, req.user.sub);
  }

  // Gym Admin views pending programs
  @Get('gym/:gymId/pending')
  @Roles(UserRole.GYM_ADMIN)
  getPending(@Param('gymId') gymId: string) {
    return this.programsService.findPendingByGym(gymId);
  }

  // Gym Admin approves or rejects
  @Patch(':id/status')
  @Roles(UserRole.GYM_ADMIN)
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdateProgramStatusDto) {
    return this.programsService.updateStatus(id, updateDto);
  }

  // Approved programs visible to all
  @Get('gym/:gymId/approved')
  getApproved(@Param('gymId') gymId: string) {
    return this.programsService.findApprovedByGym(gymId);
  }

  // FR-3.03 Coach views their own programs
  @Get('my')
  @Roles(UserRole.COACH)
  getMyPrograms(@Request() req: any) {
    return this.programsService.findByCoach(req.user.sub);
  }
}