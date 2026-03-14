import 'dotenv/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/user/entities/user.entity';
import { UsersController } from './modules/user/user.controller';
import { UsersService } from './modules/user/user.service';
import { BotService } from './bot/bot.service';
import { HomeworkService } from './modules/homework/homework.service';
import { Homework } from './modules/homework/entities/homework.entity';
import { HomeworkController } from './modules/homework/homework.controller';

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
