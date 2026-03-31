import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ProgramStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  coachId: string;

  @Column()
  gymId: string;

  @Column({ type: 'enum', enum: ProgramStatus, default: ProgramStatus.DRAFT })
  status: ProgramStatus;

  @Column({ nullable: true })
  schedule: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @Column({ nullable: true })
  // sessionsPerWeek: number;

  // @Column({ nullable: true })
  // sessionDuration: number; // in minutes

  // @Column({ nullable: true })
  // totalSlots: number;

  // @Column({ nullable: true })
  // difficulty: string; // BEGINNER, INTERMEDIATE, ADVANCED

  // @Column({ nullable: true })
  // programDuration: number; // in weeks
  }