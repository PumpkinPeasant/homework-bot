import { User, UserRole } from '../../user/user.entity';
import console from 'node:console';
import { CommandContext, Context, InlineKeyboard } from 'grammy';
import { UsersService } from '../../user/user.service';

export const start = async (ctx: CommandContext<Context>, usersService: UsersService) => {

  const menuKeyboard = new InlineKeyboard()
    .text('📚 Menu', 'open_menu')

  if (!ctx.from) {
    return ctx.reply('User info is not available');
  }

  const { id, username, first_name } = ctx.from;

  try {
    const existingUser = await usersService.findOne(id);
    if (existingUser) {
      await ctx.reply(`Hey, ${first_name}!\nI'm glad you're back! ☺️`, {
        reply_markup: menuKeyboard,
      });
    }
    else {
      const newUser: User = {
        telegramId: id ?? 1,
        telegramNickname: username ?? 'Nickname',
        name: first_name ?? 'Student',
        role: UserRole.STUDENT,
      };

      await usersService.create(newUser);

      await ctx.reply(`Welcome, ${first_name}!\nThanks for joining! ☺️`, {
        reply_markup: menuKeyboard,
      });
    }
  } catch (error) {
    console.error(`Error while creating new user:`, error);
    await ctx.reply(`Something went wrong... Try again`);
  }
}