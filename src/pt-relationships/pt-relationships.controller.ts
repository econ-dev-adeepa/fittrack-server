import {
  Controller, Get, Post, Patch, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { PTRelationshipsService } from './pt-relationships.service';
import { CreatePTRequestDto } from './dto/create-pt.dto';
import { UpdatePTStatusDto } from './dto/update-pt.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('pt-relationships')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PTRelationshipsController {
  constructor(private readonly ptService: PTRelationshipsService) {}

  // FR-4.04 Customer sends PT request
  @Post()
  @Roles(UserRole.CUSTOMER)
  create(@Body() createPTDto: CreatePTRequestDto, @Request() req: any) {
    return this.ptService.create(createPTDto, req.user.sub);
  }

  // FR-3.04 Coach views all incoming PT requests
  @Get('requests')
  @Roles(UserRole.COACH)
  getMyRequests(@Request() req: any) {
    return this.ptService.findRequestsByCoach(req.user.sub);
  }

  // FR-3.04 Coach approves → COACH_APPROVED or denies → DENIED
  @Patch(':id/coach-status')
  @Roles(UserRole.COACH)
  updateStatusByCoach(
    @Param('id') id: string,
    @Body() updateDto: UpdatePTStatusDto,
    @Request() req: any,
  ) {
    return this.ptService.updateStatusByCoach(id, req.user.sub, updateDto);
  }

  // Gym Admin views coach-approved PT requests
  @Get('gym/:gymId/coach-approved')
  @Roles(UserRole.GYM_ADMIN)
  getCoachApproved(@Param('gymId') gymId: string) {
    return this.ptService.findCoachApprovedByGym(gymId);
  }

  // Gym Admin final approval → ACTIVE or DENIED
  @Patch(':id/admin-status')
  @Roles(UserRole.GYM_ADMIN)
  updateStatusByGymAdmin(
    @Param('id') id: string,
    @Body() updateDto: UpdatePTStatusDto,
  ) {
    return this.ptService.updateStatusByGymAdmin(id, updateDto);
  }

  // FR-3.05 Coach views their active clients
  @Get('my-clients')
  @Roles(UserRole.COACH)
  getMyClients(@Request() req: any) {
    return this.ptService.findActiveClients(req.user.sub);
  }

  // FR-4.05 Customer views their PT request status
  @Get('my-status')
  @Roles(UserRole.CUSTOMER)
  getMyStatus(@Request() req: any) {
    return this.ptService.findByCustomer(req.user.sub);
  }

  // FR-4.05 Customer views their active trainer
  @Get('my-trainer')
  @Roles(UserRole.CUSTOMER)
  getMyTrainer(@Request() req: any) {
    return this.ptService.findActiveTrainer(req.user.sub);
  }
}