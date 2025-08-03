import EventEmitter from 'events';
import { Bot } from './bot';

export class AIAgent extends EventEmitter {
	bot: Bot;
	constructor(bot: Bot) {
		super();
		this.bot = bot;
	}
}
