import console from 'node:console';
import { HomeworkService } from '../../modules/homework/homework.service';
import { Homework } from '../../modules/homework/entities/homework.entity';

export const createHomework = async (
  homeworkData: Homework,
  homeworkService: HomeworkService,
) => {
  try {
    return await homeworkService.create(homeworkData);
  } catch (error) {
    console.error(`Error while creating homework:`, error);
  }
};

export const findAllDone = async (homeworkService: HomeworkService) => {
  try {
    return await homeworkService.findAllDone();
  } catch (error) {
    console.error(`Error while finding homework:`, error);
  }
};
