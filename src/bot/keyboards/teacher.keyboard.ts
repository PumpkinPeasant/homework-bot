import { InlineKeyboard } from 'grammy';

export const teachersKeyboard = new InlineKeyboard()
  .text('➕ Add homework', 'add-homework')
  .row()
  .text('👶 My students', 'show-students')
  .text('🔎 Review homework', 'review');
