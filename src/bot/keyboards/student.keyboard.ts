import { InlineKeyboard } from 'grammy';

export const studentsKeyboard = new InlineKeyboard()
  .text('📝 My homework', 'show_undone_homeworks')
  .row()
  .text('⭐ Reviewed homework', 'show_unseen_reviews')
  .text('🗓️ Homework history', 'show_homework_history');
