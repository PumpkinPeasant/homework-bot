import { UserRole } from '../entities/user.entity';

export interface CreateUserDto {
  telegramId: number;
  telegramNickname: string;
  name: string;
  role: UserRole;
}
