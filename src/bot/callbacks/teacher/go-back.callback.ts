import { teachersKeyboard } from '../../keyboards/teacher.keyboard';
import { Context } from 'grammy';

export const goBackCallback = async (ctx: Context) => {
  await ctx.editMessageText(
    `Hey, <b>Teacher</b>!\n<i>What's you up for today?</i>`,
    {
      parse_mode: 'HTML',
      reply_markup: teachersKeyboard,
    },
  );

  await ctx.answerCallbackQuery();
};
