import console from 'node:console';
import { HomeworkService } from '../../user/homework.service';
import { Homework } from '../../user/homework.entity';

export const createHomework = async (homeworkData: Homework, homeworkService: HomeworkService) => {
  try {
    return await homeworkService.create(homeworkData);
  } catch (error) {
    console.error(`Error while creating homework:`, error);
  }
};
