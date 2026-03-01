import 'dotenv/config';
import { Bot, GrammyError, HttpError, InlineKeyboard } from 'grammy';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as console from 'node:console';
import { UsersService } from '../user/user.service';
import { User, UserRole } from '../user/user.entity';
import { hydrate } from '@grammyjs/hydrate';

@Injectable()
export class BotService implements OnModuleInit {
  constructor(private usersService: UsersService) {}

  bot = new Bot(process.env.BOT_TOKEN!);

  async onModuleInit(): Promise<any> {
    console.log(`Bot has been initialized.`);

    this.bot.use(hydrate());

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

    const studentsKeyboard = new InlineKeyboard()
      .text('📝 My homework', 'show_undone_homeworks')
      .row()
      .text('⭐ Reviewed homework', 'show_unseen_reviews')
      .text('🗓️ Homework history', 'show_homework_history');

    this.bot.command('start', async (ctx) => {
      const name = ctx.from?.first_name ?? 'friend';

      const newUser: User = {
        telegramId: ctx.from?.id ?? 1,
        telegramNickname: ctx.from?.username ?? 'Nickname',
        name: ctx.from?.first_name ?? 'Student',
        role: UserRole.STUDENT,
      };

      await this.usersService.create(newUser);

      await ctx.reply(`Hey, ${name}!\nI'm glad you're here! ☺️`, {
        reply_markup: studentsKeyboard,
      });
    });

    this.bot.on('message:text').filter(
      (ctx) => ctx.from.id !== Number(process.env.TEAHCER_ID),
      async (ctx) => {
        const name = ctx.from?.first_name ?? 'friend';

        await ctx.reply(
          `Hey <b>${name}</b>!\n<i>How are you doing today? 😁</i>`,
          {
            parse_mode: 'HTML',
            reply_markup: studentsKeyboard,
          },
        );
      },
    );

    const teachersKeyboard = new InlineKeyboard()
      .text('👶 My students', 'show-students')
      .row()
      .text('➕ Add homework', 'add')
      .text('📝 Review homework', 'review');

    const backKeyboard = new InlineKeyboard().text('⬅️ Back', 'go-back');

    this.bot.on('message').filter(
      (ctx) => ctx.from.id === Number(process.env.TEAHCER_ID),
      async (ctx) => {
        await ctx.reply(
          `Hey, <b>Teacher</b>!\n<i>What's you up for today?</i>`,
          {
            parse_mode: 'HTML',
            reply_markup: teachersKeyboard,
          },
        );
      },
    );

    this.bot.callbackQuery('show-students', async (ctx) => {
      const showStudentsKeyboard = new InlineKeyboard()
        .text('👶 Student 1', 'show-student-1')
        .row()
        .text('👶 Student 2', 'show-student-2')
        .row()
        .text('👶 Student 3', 'show-student-3')
        .row()
        .text('👶 Student 4', 'show-student-4')
        .row()
        .text('⬅️ Back', 'go-back');

      const students = [1];

      if (!students.length) {
        await ctx.editMessageText(`You don't have any students yet...`, {
          reply_markup: backKeyboard,
        });
      } else {
        await ctx.editMessageText(`Select your student to assign homework`, {
          reply_markup: showStudentsKeyboard,
        });
      }

      await ctx.answerCallbackQuery();
    });

    this.bot.callbackQuery('add', async (ctx) => {
      const showStudentsKeyboard = new InlineKeyboard()
        .text('👶 Student 1', 'assign-to-student-1')
        .row()
        .text('👶 Student 2', 'assign-to-student-2')
        .row()
        .text('👶 Student 3', 'assign-to-student-3')
        .row()
        .text('👶 Student 4', 'assign-to-student-4')
        .row()
        .text('⬅️ Back', 'go-back');

      const students = [1];

      if (!students.length) {
        await ctx.editMessageText(`There is no one to assign homework for...`, {
          reply_markup: backKeyboard,
        });
      } else {
        await ctx.editMessageText(`Select your student to assign homework`, {
          reply_markup: showStudentsKeyboard,
        });
      }

      await ctx.answerCallbackQuery();
    });

    this.bot.callbackQuery('review', async (ctx) => {
      await ctx.editMessageText(`There is nothing to review yet...`, {
        reply_markup: backKeyboard,
      });

      await ctx.answerCallbackQuery();
    });

    this.bot.callbackQuery('go-back', async (ctx) => {
      await ctx.editMessageText(
        `Hey, <b>Teacher</b>!\n<i>What's you up for today?</i>`,
        {
          parse_mode: 'HTML',
          reply_markup: teachersKeyboard,
        },
      );

      await ctx.answerCallbackQuery();
    });

    this.bot.catch((error) => {
      const ctx = error.ctx;
      console.error(`Error: ${ctx.update.update_id}`);

      const e = error.error;

      if (e instanceof GrammyError) {
        console.error(`Error in request ${e.description}`);
      } else if (e instanceof HttpError) {
        console.error(`Could not connect Telegram, ${e}`);
      } else {
        console.error(`Unknown error: ${e}`);
      }
    });

    await this.bot.start();
  }
}
