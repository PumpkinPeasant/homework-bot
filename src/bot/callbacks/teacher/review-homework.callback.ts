import { backKeyboard } from '../../keyboards/back.keyboard';
import { Context, InlineKeyboard } from 'grammy';
import { findAllDone } from '../../controllers';
import { HomeworkService } from '../../../modules/homework/homework.service';
import { formatToUs } from '../../../utils/date-format';

export const reviewHomeworkCallback = async (
  ctx: Context,
  homeworkService: HomeworkService,
) => {
  const homeworks = await findAllDone(homeworkService).catch(async () => {
    await ctx.reply(`Something went wrong... Try again`);
  });

  await ctx.answerCallbackQuery();

  if (homeworks) {
    const btns = homeworks.map((homework) => [
      InlineKeyboard.text(
        `From ${formatToUs(new Date(homework.createdAt ?? Date.now()))} for 👶 ${homework.user.name} | @${homework.user.telegramNickname}`,
        `review-${homework.id}`,
      ),
    ]);

    const showHomeworksKeyboard = InlineKeyboard.from(btns)
      .row()
      .text('↩️ Back', 'go-back');

    await ctx.editMessageText(`🔎 Which homework do you want to review?`, {
      reply_markup: showHomeworksKeyboard,
    });

    return;
  }

  await ctx.editMessageText(`👀 There is nothing to review yet...`, {
    reply_markup: backKeyboard,
  });
};
