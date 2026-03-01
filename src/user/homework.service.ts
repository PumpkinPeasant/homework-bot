import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Homework } from './homework.entity';

@Injectable()
export class HomeworkService {
  constructor(
    @InjectRepository(Homework)
    private homeworkRepository: Repository<Homework>,
  ) {}

  public async create(homework: Homework): Promise<Homework> {
    return await this.homeworkRepository.save(homework);
  }

  async delete(id: number): Promise<void> {
    await this.homeworkRepository.delete(id);
  }
}
