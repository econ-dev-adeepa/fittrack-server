import {
  Controller, Get, Post, Patch, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { AffiliationsService } from './affiliations.service';
import { CreateAffiliationDto } from './dto/create-affiliation.dto';
import { UpdateAffiliationDto } from './dto/update-affiliation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { AffiliationType } from './gym-affiliation.entity';

@Controller('affiliations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AffiliationsController {
  constructor(private readonly affiliationsService: AffiliationsService) {}

  // Coach or Customer submits gym affiliation request
  @Post()
  @Roles(UserRole.COACH, UserRole.CUSTOMER)
  create(@Body() createAffiliationDto: CreateAffiliationDto, @Request() req: any) {
    return this.affiliationsService.create(createAffiliationDto, req.user.sub);
  }

  // FR-4.03 Customer views approved coaches in their gym
  @Get('gym/:gymId/coaches')
  getApprovedCoaches(@Param('gymId') gymId: string) {
    return this.affiliationsService.findApprovedCoachesByGym(gymId);
  }

  // Gym Admin views all customers
  @Get('gym/:gymId/customers')
  @Roles(UserRole.GYM_ADMIN)
  getCustomers(@Param('gymId') gymId: string) {
    return this.affiliationsService.findByGymAndType(gymId, AffiliationType.CUSTOMER);
  }

  // Gym Admin views pending requests
  @Get('gym/:gymId/pending')
  @Roles(UserRole.GYM_ADMIN)
  getPending(@Param('gymId') gymId: string) {
    return this.affiliationsService.findPending(gymId);
  }

  // Gym Admin approves or rejects
  @Patch(':id/status')
  @Roles(UserRole.GYM_ADMIN)
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdateAffiliationDto) {
    return this.affiliationsService.updateStatus(id, updateDto);
  }

  // User views their own affiliations
  @Get('my')
  getMyAffiliations(@Request() req: any) {
    return this.affiliationsService.findByUser(req.user.sub);
  }
}