import console from 'node:console';
import { UsersService } from '../../modules/user/user.service';
import { CreateUserDto } from '../../modules/user/dto/create-user.dto';

export const getAllUsers = async (userService: UsersService) => {
  try {
    return await userService.findAll();
  } catch (error) {
    console.error(`Error while fetching users:`, error);
  }
};

export const getUserById = async (id: number, userService: UsersService) => {
  try {
    return await userService.findOne(id);
  } catch (error) {
    console.error(`Error while getting user by id:`, error);
  }
};

export const createUser = async (
  userData: CreateUserDto,
  userService: UsersService,
) => {
  try {
    return await userService.create(userData);
  } catch (error) {
    console.error(`Error while creating new user:`, error);
  }
};
