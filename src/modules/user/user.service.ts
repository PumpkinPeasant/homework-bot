import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  public async create(user: CreateUserDto): Promise<User> {
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return await this.usersRepository.findOneBy({ telegramId: id });
  }

  async update(id: number, user: User): Promise<User> {
    const entity = await this.usersRepository.preload({
      ...user,
      telegramId: id,
    });

    if (!entity) {
      throw new NotFoundException('User not found');
    }

    return await this.usersRepository.save(entity);
  }

  async delete(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
