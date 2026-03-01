import 'dotenv/config';
import { Bot, Context, GrammyError, HttpError, InlineKeyboard, session, SessionFlavor } from 'grammy';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as console from 'node:console';
import { UsersService } from '../user/user.service';
import { hydrate } from '@grammyjs/hydrate';
import { start } from './commands';
import { createHomework, getAllUsers, getUserById } from './controllers';
import { HomeworkService } from '../user/homework.service';
import { User } from '../user/user.entity';

enum SessionState {
  IDLE,
  SET_HOMEWORK
}

interface CurrentStudent {
  telegramId: number,
  name: string,
  telegramNickname: string
}

interface SessionData {
  state: SessionState;
  currentStudent?: CurrentStudent | null;
  draftHomework?: string | null;
}

type MyContext = Context & SessionFlavor<SessionData>;

@Injectable()
export class BotService implements OnModuleInit {
  constructor(private usersService: UsersService, private homeworkService: HomeworkService) {
  }

  bot = new Bot<MyContext>(process.env.BOT_TOKEN!);

  async onModuleInit(): Promise<any> {
    console.log(`Bot has been initialized.`);

    this.bot.use(hydrate());

    const initial = (): SessionData => ({ state: SessionState.IDLE });

    this.bot.use(session({ initial }));

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
      .text('➕ Add homework', 'add-student-homework')
      .row()
      .text('👶 My students', 'show-students')
      .text('🔎 Review homework', 'review');

    const backKeyboard = new InlineKeyboard().text('⬅️ Back', 'go-back');

    const openMenu = async (ctx: Context) => {
      if (!ctx.from) {
        return ctx.reply('User info is not available');
      }

      const { id, first_name } = ctx.from;

      if (id !== Number(process.env.TEAHCER_ID)) {
        await ctx.editMessageText(
          `Hey <b>${first_name}</b>!\n<i>How are you doing today? 😁</i>`,
          {
            parse_mode: 'HTML',
            reply_markup: studentsKeyboard,
          },
        );
      } else {
        await ctx.editMessageText(
          `Hey, <b>Teacher</b>!\n<i>What's you up for today?</i>`,
          {
            parse_mode: 'HTML',
            reply_markup: teachersKeyboard,
          },
        );
      }

      await ctx.answerCallbackQuery();
    };

    this.bot.callbackQuery('open_menu', (ctx) => openMenu(ctx));

    // this.bot.on('message', (ctx) => openMenu(ctx));

    this.bot.callbackQuery('show-students', async (ctx) => {
      const users = await getAllUsers(this.usersService).catch(async () => {
        await ctx.reply(`Something went wrong... Try again`);
      });

      if (!users) {
        await ctx.editMessageText(`You don't have any students yet...`, {
          reply_markup: backKeyboard,
        });
      } else {
        const btns = users.map((user) => [
          InlineKeyboard.text(
            `👶 ${user.name} | @${user.telegramNickname}`,
            `show-student-${user.telegramId}`,
          ),
        ]);
        const showStudentsKeyboard = InlineKeyboard.from(btns)
          .row()
          .text('↩️ Back', 'go-back');

        await ctx.editMessageText(
          `📊 Select your student to see their stats:`,
          {
            reply_markup: showStudentsKeyboard,
          },
        );
      }

      await ctx.answerCallbackQuery();
    });

    this.bot.callbackQuery('add-student-homework', async (ctx) => {
      const users = await getAllUsers(this.usersService).catch(async () => {
        await ctx.reply(`Something went wrong... Try again`);
      });

      await ctx.answerCallbackQuery();
      if (users) {
        const btns = users.map((user) => [
          InlineKeyboard.text(
            `👶 ${user.name} | @${user.telegramNickname}`,
            `assign-to-student-${user.telegramId}`,
          ),
        ]);
        const showStudentsKeyboard = InlineKeyboard.from(btns)
          .row()
          .text('↩️ Back', 'go-back');

        await ctx.editMessageText(`📝 Select your student to assign homework`, {
          reply_markup: showStudentsKeyboard,
        });

        return;
      }

      await ctx.editMessageText(`There is no one to assign homework for...`, {
        reply_markup: backKeyboard,
      });
    });

    this.bot.callbackQuery(/^assign-to-student-(\d+)$/, async (ctx) => {
      const telegramId = Number(ctx.match[1]);

      const user = await getUserById(telegramId, this.usersService);

      await ctx.answerCallbackQuery();
      if (user) {
        ctx.session.state = SessionState.SET_HOMEWORK;
        ctx.session.currentStudent = {
          telegramId: user.telegramId,
          name: user.name,
          telegramNickname: user.telegramNickname,
        };

        await ctx.editMessageText(
          `Write down the homework for: 👶 ${user.name} | @${user.telegramNickname}`,
          {
            reply_markup: backKeyboard,
          },
        );
        return;
      }
      await ctx.reply(`Something went wrong... Try again`, {
        reply_markup: backKeyboard,
      });
    });

    this.bot.on('message:text')
      .filter((ctx) => ctx.session.state === SessionState.SET_HOMEWORK,
        async (ctx) => {

          const user = ctx.session.currentStudent;

          if (user) {
            ctx.session.draftHomework = ctx.update.message.text;

            const setHomeworkKeyboard = new InlineKeyboard()
              .text('↩️ Back', 'go-back')
              .text(`✅ Send to ${user.name}`, 'send-homework');

            await ctx.reply(`Homework:  \n<blockquote>${ctx.update.message.text}</blockquote>\nis going to be assigned to: 👶 ${user.name} | @${user.telegramNickname}`, {
              parse_mode: 'HTML',
              reply_markup: setHomeworkKeyboard,
            });
            return;
          }

          await ctx.reply(`Something went wrong... Try again`, {
            reply_markup: backKeyboard,
          });

        });


    this.bot.callbackQuery('send-homework', async (ctx) => {

      const draftHomework = ctx.session.draftHomework;
      const userId = ctx.session.currentStudent?.telegramId;

      await ctx.answerCallbackQuery();
      if (draftHomework && userId) {
        const user = await getUserById(userId, this.usersService);
        if (user) {
          const homework = {
            description: draftHomework,
            user: user,
          };

          await createHomework(homework, this.homeworkService);

          await ctx.editMessageText(`Homework is successfully assigned to: 👶 ${user.name} | @${user.telegramNickname}\nWhat are we going to do next, Mr. Teacher ? 😎`, {
            reply_markup: teachersKeyboard,
          });

          ctx.session.draftHomework = null;
          ctx.session.currentStudent = null;
          ctx.session.state = SessionState.IDLE;
          return;
        }
      }

      await ctx.reply(`Something went wrong... Try again`, {
        reply_markup: backKeyboard,
      });
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
