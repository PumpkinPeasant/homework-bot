import { Context, SessionFlavor } from 'grammy';
import { SessionData } from '../interfaces/session.interface';

export type MyContext = Context & SessionFlavor<SessionData>;
