import EventEmitter from 'events';
import { ContextManager } from './contextManager.js';

export class Bot extends EventEmitter {
	context: ContextManager;
	client: any;
	applicationId = '';
	currentVoiceSession?: any;
	voiceStateHandler?: any;
	agent?: any;
	captureChannel?: any;
	constructor(context: ContextManager) {
		super();
		this.context = context;
		this.client = {};
	}
}
