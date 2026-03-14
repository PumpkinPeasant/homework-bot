import { Context } from 'grammy';
import { studentsKeyboard } from '../keyboards/student.keyboard';
import { teachersKeyboard } from '../keyboards/teacher.keyboard';

export const openMenu = async (ctx: Context) => {
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
