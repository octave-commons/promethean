import { createStore } from './createStore.js';
import { initialState, reducer } from './reducer.js';
import { registerVoiceEffects } from './effects/voice.js';

export const store = createStore(initialState, reducer);
registerVoiceEffects(store);
