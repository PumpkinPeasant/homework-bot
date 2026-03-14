import 'dotenv/config';
import { Bot, GrammyError, HttpError, session } from 'grammy';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as console from 'node:console';
import { UsersService } from '../modules/user/user.service';
import { hydrate } from '@grammyjs/hydrate';
import { start } from './commands';
import { HomeworkService } from '../modules/homework/homework.service';
import { SessionData } from './interfaces/session.interface';
import { SessionState } from './enums/state.enum';
import { MyContext } from './types/context';
import { addHomework } from './scenes/teacher/add-homework';
import { reviewHomework } from './scenes/teacher/review-homework';
import { openMenu } from './callbacks/open-menu.callback';
import { showStudentsCallback } from './callbacks/teacher/show-students.callback';
import { addHomeworkCallback } from './callbacks/teacher/add-homework.callback';
import { reviewHomeworkCallback } from './callbacks/teacher/review-homework.callback';
import { goBackCallback } from './callbacks/teacher/go-back.callback';

@Injectable()
export class BotService implements OnModuleInit {
  constructor(
    private usersService: UsersService,
    private homeworkService: HomeworkService,
  ) {}

  bot = new Bot<MyContext>(process.env.BOT_TOKEN!);

  async onModuleInit(): Promise<any> {
    console.log(`Bot has been initialized.`);

    this.bot.use(hydrate());

    const initial = (): SessionData => ({ state: SessionState.IDLE });

    this.bot.use(session({ initial }));

    /*                   */
    /*      COMMANDS     */
    /*                   */
    await this.bot.api.setMyCommands([
      {
        command: 'start',
        description: 'Start the Bot',
      },
      {
        command: 'menu',
        description: 'Opens the menu',
      },
    ]);

    this.bot.command('start', (ctx) => start(ctx, this.usersService));

    this.bot.callbackQuery('open_menu', (ctx) => openMenu(ctx));

    /*                   */
    /* TEACHER CALLBACKS */
    /*                   */
    this.bot.callbackQuery('show-students', (ctx) =>
      showStudentsCallback(ctx, this.usersService),
    );

    this.bot.callbackQuery('add-homework', (ctx) =>
      addHomeworkCallback(ctx, this.usersService),
    );
    addHomework(this.bot, this.usersService, this.homeworkService);

    this.bot.callbackQuery('review', (ctx) =>
      reviewHomeworkCallback(ctx, this.homeworkService),
    );
    reviewHomework();

    this.bot.callbackQuery('go-back', (ctx) => goBackCallback(ctx));

    this.bot.catch((error) => {
      const ctx = error.ctx;
      console.error(`Error: ${ctx.update.update_id}`);

      const e = error.error;

      if (e instanceof GrammyError) {
        console.error(`Error in request ${e.description}`);
      } else if (e instanceof HttpError) {
        console.error(`Could not connect Telegram, ${e}`);
      } else {
        console.error(`Unknown error: ${String(e)}`);
      }
    });

    await this.bot.start();
  }
}
