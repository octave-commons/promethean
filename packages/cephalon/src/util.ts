import { formatMessage } from '@promethean-os/persistence/contextStore.js';

export function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

export function choice(array: string[]) {
  return array[randomInt(array.length)];
}

export function generatePromptChoice() {
  const choices = [
    'What would you like to say?',
    'What do you want to say?',
    'What do you want to talk about?',
    'What do you want to say out loud?',
    'Say something witty and engaging. Consider everything you and I have said, and your thoughts.',
    'What do you want to say out loud? Consider everything you and I have said, and your thoughts.',
    'What do you want to say out loud? Consider everything you and I have said',
    'How would you respond to the current conversation?',
    'Say something.',
    'Be creative and say something interesting.',
    'Respond to the current conversation in a witty and engaging way.',
    'What are your thoughts on the current situation?',
    "What's going on right now?",
  ];
  return choice(choices) as string;
}

export function generateSpecialQuery(latestUserMessage: any, promptChoice: string): string {
  return `
The last thing you heard was:
${formatMessage(latestUserMessage, (epochMs: number) => new Date(epochMs).toLocaleString())}

${promptChoice}

Talk to the user about the image on the screen and engage with the conversation.
`;
}
