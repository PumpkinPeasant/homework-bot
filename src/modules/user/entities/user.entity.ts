import { Column, Entity, PrimaryColumn, OneToMany } from 'typeorm';
import { Homework } from '../../homework/entities/homework.entity';

export enum UserRole {
  TEACHER,
  STUDENT,
}

@Entity()
export class User {
  @PrimaryColumn()
  telegramId: number;

  @Column()
  telegramNickname: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @OneToMany(() => Homework, (homework) => homework.user)
  homeworks: Homework[];

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
