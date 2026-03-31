import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('training_plans')
export class TrainingPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  programId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  sessionsPerWeek: number;

  @Column({ nullable: true })
  sessionDuration: number;

  @Column({ nullable: true })
  totalSlots: number;

  @Column({ nullable: true })
  difficulty: string;

  @Column({ nullable: true })
  programDuration: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}