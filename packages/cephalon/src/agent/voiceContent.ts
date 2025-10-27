import { formatMessage } from '@promethean-os/persistence/contextStore.js';

import { generatePromptChoice, generateSpecialQuery } from '../util.js';

import type { AIAgent } from './index.js';

export async function generateVoiceContentFromSinglePrompt(this: AIAgent) {
  let content = '';
  let counter = 0;
  const context = await this.context.compileContext([this.prompt], this.historyLimit, 5, 5, true);
  const text = context.map((m: { content: string }) => m.content).join('\n');

  while (!content && counter < 5) {
    content = (await this.generateResponse({
      specialQuery: `
This is  a transcript of a conversation you and I have been having using a voice channel.
${text}
`,
      context: [],
    })) as string;
    counter++;
  }

  return content;
}

export async function generateVoiceContentWithFormattedLatestmessage(this: AIAgent) {
  let content = '';
  let counter = 0;
  const userCollection = this.context.getCollection('transcripts');
  const latestUserMessage = (await userCollection.getMostRecent(1))[0];
  const context = (await this.context.compileContext([this.prompt], this.historyLimit)).filter(
    (m: { content: string }) => m.content !== latestUserMessage?.text,
  );

  context.push({
    role: 'user',
    content: formatMessage(latestUserMessage, (epochMs: number) =>
      new Date(epochMs).toLocaleString(),
    ),
  });

  while (!content && counter < 5) {
    content = (await this.generateResponse({
      context,
    })) as string;
    counter++;
  }

  return content;
}

export async function generateVoiceContentWithChoicePrompt(this: AIAgent) {
  let content = '';
  let counter = 0;
  const context = await this.context.compileContext([this.prompt], this.historyLimit);
  while (!content && counter < 5) {
    content = (await this.generateResponse({
      specialQuery: ` ${generatePromptChoice()} `,
      context,
    })) as string;
    counter++;
  }

  return content;
}

export async function generateVoiceContentWithSpecialQuery(this: AIAgent) {
  let content = '';
  let counter = 0;
  const userCollection = this.context.getCollection('transcripts');
  const latestUserMessage = (await userCollection.getMostRecent(1))[0];
  const context = (await this.context.compileContext([this.prompt], this.historyLimit)).filter(
    (m: { content: string }) => m.content !== latestUserMessage?.text,
  );
  while (!content && counter < 5) {
    content = (await this.generateResponse({
      specialQuery: generateSpecialQuery(latestUserMessage, generatePromptChoice()),
      context,
    })) as string;
    counter++;
  }

  return content;
}

export async function generateVoiceContentWithoutSpecialQuery(this: AIAgent) {
  let content = '';
  let counter = 0;
  const context = await this.context.compileContext([this.prompt], this.historyLimit);
  while (!content && counter < 5) {
    content = (await this.generateResponse({
      context,
    })) as string;
    counter++;
  }

  return content;
}

export async function generateVoiceContent(this: AIAgent) {
  return this.generateVoiceContentWithChoicePrompt();
}
