import { getAllUsers } from '../../controllers';
import { Context, InlineKeyboard } from 'grammy';
import { backKeyboard } from '../../keyboards/back.keyboard';
import { UsersService } from '../../../modules/user/user.service';

export const addHomeworkCallback = async (
  ctx: Context,
  userService: UsersService,
) => {
  const users = await getAllUsers(userService).catch(async () => {
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

  await ctx.editMessageText(`👀 There is no one to assign homework for...`, {
    reply_markup: backKeyboard,
  });
};
