import { getAllUsers } from '../../controllers';
import { backKeyboard } from '../../keyboards/back.keyboard';
import { Context, InlineKeyboard } from 'grammy';
import { UsersService } from '../../../modules/user/user.service';

export const showStudentsCallback = async (
  ctx: Context,
  userService: UsersService,
) => {
  const users = await getAllUsers(userService).catch(async () => {
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

    await ctx.editMessageText(`📊 Select your student to see their stats:`, {
      reply_markup: showStudentsKeyboard,
    });
  }

  await ctx.answerCallbackQuery();
};
