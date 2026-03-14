import { backKeyboard } from '../../keyboards/back.keyboard';
import { Context } from 'grammy';

export const reviewHomeworkCallback = async (ctx: Context) => {
  await ctx.editMessageText(`There is nothing to review yet...`, {
    reply_markup: backKeyboard,
  });

  await ctx.answerCallbackQuery();
};
