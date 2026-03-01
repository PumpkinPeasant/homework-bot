import 'dotenv/config';
import {
  Bot,
  Context,
  GrammyError,
  HttpError,
  InlineKeyboard,
} from 'grammy';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as console from 'node:console';
import { UsersService } from '../user/user.service';
import { hydrate } from '@grammyjs/hydrate';
import { start } from './commands';

@Injectable()
export class BotService implements OnModuleInit {
  constructor(private usersService: UsersService) {
  }

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

    this.bot.command('start', (ctx) => start(ctx, this.usersService));

    const studentsKeyboard = new InlineKeyboard()
      .text('📝 My homework', 'show_undone_homeworks')
      .row()
      .text('⭐ Reviewed homework', 'show_unseen_reviews')
      .text('🗓️ Homework history', 'show_homework_history');

    const teachersKeyboard = new InlineKeyboard()
      .text('👶 My students', 'show-students')
      .row()
      .text('➕ Add homework', 'add')
      .text('🔎 Review homework', 'review');

    const backKeyboard = new InlineKeyboard().text('⬅️ Back', 'go-back');

    const openMenu = async (ctx: Context) => {
      if (!ctx.from) {
        return ctx.reply('User info is not available');
      }

      const { id, first_name } = ctx.from;

      if (id !== Number(process.env.TEAHCER_ID)) {
        await ctx.editMessageText(`Hey <b>${first_name}</b>!\n<i>How are you doing today? 😁</i>`,
          {
            parse_mode: 'HTML',
            reply_markup: studentsKeyboard,
          });
      } else {
        await ctx.editMessageText(`Hey, <b>Teacher</b>!\n<i>What's you up for today?</i>`,
          {
            parse_mode: 'HTML',
            reply_markup: teachersKeyboard,
          });
      }

      await ctx.answerCallbackQuery();
    };

    this.bot.callbackQuery('open_menu', (ctx) => openMenu(ctx));

    // this.bot.on('message', (ctx) => openMenu(ctx));

    const fetchStudents = async (ctx: Context) => {
      try {
        return await this.usersService.findAll();
      } catch (error) {
        console.error(`Error while fetching users:`, error);
        await ctx.reply(`Something went wrong... Try again`);
      }
    };

    this.bot.callbackQuery('show-students', async (ctx) => {

      const users = await fetchStudents(ctx);

      if (!users) {
        await ctx.editMessageText(`You don't have any students yet...`, {
          reply_markup: backKeyboard,
        });
      } else {
        const btns = users.map((user) => [InlineKeyboard.text(`👶 ${user.name} | @${user.telegramNickname}`, `show-student-${user.telegramId}`)]);
        const showStudentsKeyboard = InlineKeyboard
          .from(btns)
          .row()
          .text('↩️ Back', 'go-back');

        await ctx.editMessageText(`📊 Select your student to see their stats:`, {
          reply_markup: showStudentsKeyboard,
        });
      }

      await ctx.answerCallbackQuery();
    });

    this.bot.callbackQuery('add', async (ctx) => {
      const users = await fetchStudents(ctx);

      if (!users) {
        await ctx.editMessageText(`There is no one to assign homework for...`, {
          reply_markup: backKeyboard,
        });
      } else {
        const btns = users.map((user) => [InlineKeyboard.text(`👶 ${user.name} | @${user.telegramNickname}`, `assign-to-student-${user.telegramId}`)]);
        const showStudentsKeyboard = InlineKeyboard
          .from(btns)
          .row()
          .text('↩️ Back', 'go-back');

        await ctx.editMessageText(`📝 Select your student to assign homework`, {
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
