import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PTStatus {
  REQUESTED = 'REQUESTED',
  COACH_APPROVED = 'COACH_APPROVED',
  ACTIVE = 'ACTIVE',
  DENIED = 'DENIED',
}

@Entity('pt_relationships')
export class PTRelationship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column()
  coachId: string;

  @Column()
  gymId: string;

  @Column({ type: 'enum', enum: PTStatus, default: PTStatus.REQUESTED })
  status: PTStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  preferredDays: string;

  @Column({ nullable: true })
  preferredTime: string;

  @Column({ nullable: true })
  notes: string;
}