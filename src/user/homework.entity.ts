import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export enum HomeworkStatus {
  CREATED,
  DONE,
  REVIEWED,
}

@Entity()
export class Homework {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({
    type: 'enum',
    enum: HomeworkStatus,
    default: HomeworkStatus.CREATED,
  })
  status?: HomeworkStatus;

  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.homeworks)
  user: User;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt?: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  doneAt?: string | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  reviewedAt?: string | null;
}
