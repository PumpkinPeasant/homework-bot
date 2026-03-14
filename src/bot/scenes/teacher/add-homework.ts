import { Bot, InlineKeyboard } from 'grammy';
import { UsersService } from '../../../modules/user/user.service';
import { createHomework, getUserById } from '../../controllers';
import { backKeyboard } from '../../keyboards/back.keyboard';
import { SessionState } from '../../enums/state.enum';
import { teachersKeyboard } from '../../keyboards/teacher.keyboard';
import { HomeworkService } from '../../../modules/homework/homework.service';
import { MyContext } from '../../types/context';

export const addHomework = (
  bot: Bot<MyContext>,
  usersService: UsersService,
  homeworkService: HomeworkService,
) => {
  bot.callbackQuery(/^assign-to-student-(\d+)$/, async (ctx) => {
    const telegramId = Number(ctx.match[1]);

    const user = await getUserById(telegramId, usersService);

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

  bot.on('message:text').filter(
    (ctx) => ctx.session.state === SessionState.SET_HOMEWORK,
    async (ctx) => {
      const user = ctx.session.currentStudent;

      if (user) {
        ctx.session.draftHomework = ctx.update.message.text;

        const setHomeworkKeyboard = new InlineKeyboard()
          .text('↩️ Back', 'go-back')
          .text(`✅ Send to ${user.name}`, 'send-homework');

        await ctx.reply(
          `Homework:  \n<blockquote>${ctx.update.message.text}</blockquote>\nis going to be assigned to: 👶 ${user.name} | @${user.telegramNickname}`,
          {
            parse_mode: 'HTML',
            reply_markup: setHomeworkKeyboard,
          },
        );
        return;
      }

      await ctx.reply(`Something went wrong... Try again`, {
        reply_markup: backKeyboard,
      });
    },
  );

  bot.callbackQuery('send-homework', async (ctx) => {
    const draftHomework = ctx.session.draftHomework;
    const userId = ctx.session.currentStudent?.telegramId;

    await ctx.answerCallbackQuery();
    if (draftHomework && userId) {
      const user = await getUserById(userId, usersService);
      if (user) {
        const homework = {
          description: draftHomework,
          user: user,
        };

        await createHomework(homework, homeworkService);

        await ctx.editMessageText(
          `Homework is successfully assigned to: 👶 ${user.name} | @${user.telegramNickname}\nWhat are we going to do next, Mr. Teacher ? 😎`,
          {
            reply_markup: teachersKeyboard,
          },
        );

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
};
