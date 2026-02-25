import 'dotenv/config';
import { Bot } from 'grammy';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as console from 'node:console';
import { Menu } from '@grammyjs/menu';
import { UsersService } from '../user/user.service';
import { User } from '../user/user.entity';

@Injectable()
export class BotService implements OnModuleInit {
  constructor(private usersService: UsersService) {
  }

  bot = new Bot(process.env.BOT_TOKEN!);

  async onModuleInit(): Promise<any> {
    console.log(`Bot has been initialized.`);

    const menu = new Menu('main-menu')
      .text('A', (ctx) => ctx.reply('You pressed A'))
      .row()
      .text('B', (ctx) => ctx.reply('You pressed B'));

    this.bot.use(menu);

    this.bot.command('start', async (ctx) => {
      const name = ctx.from?.first_name ?? 'friend';

      const newUser: User = {
        id: 123,
        telegramId: ctx.from?.id ?? 1,
        telegramNickname: ctx.from?.username ?? 'Nickname',
        name: ctx.from?.first_name ?? 'Student',
        role: 'STUDENT',
      };

      await this.usersService.create(newUser);

      await ctx.reply(`Hey ${name}!`, {
        reply_markup: menu,
      });
    });

    this.bot.on('message:text', (ctx) => {
      ctx.reply('Echo: ' + ctx.message.text);
    });

    await this.bot.start();
  }
}