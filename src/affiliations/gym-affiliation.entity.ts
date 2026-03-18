import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AffiliationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum AffiliationType {
  COACH = 'COACH',
  CUSTOMER = 'CUSTOMER',
}

@Entity('gym_affiliations')
export class GymAffiliation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  gymId: string;

  @Column({ type: 'enum', enum: AffiliationType })
  type: AffiliationType;

  @Column({ type: 'enum', enum: AffiliationStatus, default: AffiliationStatus.PENDING })
  status: AffiliationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}