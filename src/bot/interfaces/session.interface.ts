import { SessionState } from '../enums/state.enum';

export interface CurrentStudent {
  telegramId: number;
  name: string;
  telegramNickname: string;
}

export interface SessionData {
  state: SessionState;
  currentStudent?: CurrentStudent | null;
  draftHomework?: string | null;
}
