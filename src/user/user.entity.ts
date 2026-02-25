import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  telegramId: number;

  @Column()
  telegramNickname: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ['TEACHER', 'STUDENT'],
  })
  role: UserRole;
}

export type UserRole = 'TEACHER' | 'STUDENT';
