import { createStore } from './createStore.js';
import { initialState, reducer } from './reducer.js';
import { registerVoiceEffects } from './effects/voice.js';

const dummyBus = { publish: (_msg: any) => {} };

export const store = createStore(initialState, reducer);
registerVoiceEffects(store, dummyBus);
