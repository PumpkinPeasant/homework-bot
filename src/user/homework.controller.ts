import { Controller } from '@nestjs/common';
import { HomeworkService } from './homework.service';

@Controller('homeworks')
export class HomeworkController {
  constructor(private homeworkService: HomeworkService) {}
}
