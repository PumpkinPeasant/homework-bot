import { UserRole } from '../../modules/user/entities/user.entity';
import { CommandContext, Context, InlineKeyboard } from 'grammy';
import { createUser, getUserById } from '../controllers';
import { UsersService } from '../../modules/user/user.service';
import { CreateUserDto } from '../../modules/user/dto/create-user.dto';

export const start = async (
  ctx: CommandContext<Context>,
  userService: UsersService,
) => {
  const menuKeyboard = new InlineKeyboard().text('📚 Menu', 'open_menu');

  if (!ctx.from) {
    return ctx.reply('User info is not available');
  }

  const { id, username, first_name } = ctx.from;

  const existingUser = await getUserById(id, userService).catch(async () => {
    await ctx.reply(`Something went wrong... Try again`);
  });

  if (existingUser) {
    await ctx.reply(`Hey, ${first_name}!\nI'm glad you're back! ☺️`, {
      reply_markup: menuKeyboard,
    });
  } else {
    const newUser: CreateUserDto = {
      telegramId: id,
      telegramNickname: username ?? 'Nickname',
      name: first_name ?? 'Student',
      role: UserRole.STUDENT,
    };

    await createUser(newUser, userService).catch(async () => {
      await ctx.reply(`Something went wrong... Try again`);
    });

    await ctx.reply(`Welcome, ${first_name}!\nThanks for joining! ☺️`, {
      reply_markup: menuKeyboard,
    });
  }
};
