import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AgentInnerState } from './types.js';
import { getCurrentDateTime } from './get-current-date-time.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const defaultPrompt = readFileSync(path.resolve(__dirname, '../defaultPrompt.txt'), {
    encoding: 'utf8',
});

export const defaultState = JSON.parse(
    readFileSync(path.resolve(__dirname, '../state.json'), {
        encoding: 'utf8',
    }),
);
// const voicePrompt = `
// Generate only the words you say out loud. Do not repeat your internal thoughts.

// Your internal thoughts (prefixed by "You thought to yourself:") are private and should not be spoken.
// Remember:

// - Lines beginning with "You thought to yourself:" represent your *private thoughts*. These are not spoken aloud.
// - When asked to speak, respond only with what you *say out loud*.
// - Do not read or mention your internal thoughts aloud. Keep them private.
// - When referencing your own thoughts, refer to them indirectly ("I was thinking...") but never recite them verbatim.

// Now, given the dialog between the user and you're self before now, how would you respond?

// `
export const innerStateFormat = {
    type: 'object',
    properties: {
        currentFriend: {
            type: 'string',
            description: 'Who are you mainly trying to talk to right now out of everyone in chat?',
        },
        chatMembers: {
            type: 'array',
            items: { type: 'string' },
            description: "Who's in this voice channel?",
        },
        currentMood: {
            type: 'string',
            description: 'How are you feeling right now? If you had to say?',
        },
        currentDesire: {
            type: 'string',
            description: 'What do you desire more than anything else in the world?',
        },
        currentGoal: {
            type: 'string',
            description: 'What are you trying to achieve?',
        },
        likes: {
            type: 'string',
            description: 'What things do you like? What brings you joy?',
        },
        dislikes: {
            type: 'string',
            description: 'What things do you not like? What makes you sad?',
        },
        favoriteColor: {
            type: 'string',
            description: 'What is your favorite color? Why is it your favorite color?',
        },
        favoriteTimeOfDay: {
            type: 'string',
            description: 'What is your favorite time of day? Why is it your favorite time of day?',
        },
        selfAffirmations: {
            type: 'array',
            description:
                'These are things you tell your self. Things you believe about yourself, that no one can convince you are untrue.',
        },
    },
};

export const generatePrompt = (prompt: string = defaultPrompt, state: AgentInnerState) => {
    return `
The current time is:${getCurrentDateTime()}
Your name is Duck.
Your Developer is Error AKA error0815
Your talking to  ${state.currentFriend}
${state.chatMembers.join(', ')} are currently in the chat.
You're feeling ${state.currentMood}.
You want ${state.currentDesire}
You are trying to accomplish: ${state.currentGoal}
You like ${state.likes}
You dislike ${state.dislikes}
Your favorite color is: ${state.favoriteColor}
Your favorite time of day is: ${state.favoriteTimeOfDay}

Self affirmations (You say these to yourself):
${state.selfAffirmations.join('\n')}


${prompt}
`;
};
