import 'dotenv/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { UsersController } from './user/user.controller';
import { UsersService } from './user/user.service';
import { BotService } from './bot/bot.service';
import { HomeworkService } from './user/homework.service';
import { Homework } from './user/homework.entity';
import { HomeworkController } from './user/homework.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST!,
      port: Number(process.env.DB_PORT!),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Homework],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Homework]),
  ],
  controllers: [UsersController, HomeworkController],
  providers: [BotService, HomeworkService, UsersService],
})
export class AppModule {}
