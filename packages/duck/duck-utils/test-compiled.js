// Test file to verify compiled ClojureScript works
const {
  parseBool,
  HAS_BLOBS,
  STT_TTS_ENABLED,
  flags,
} = require('./dist/promethean.duck_utils.flags.js');

console.log('Testing compiled ClojureScript...');

// Test parseBool function
console.log('parseBool(undefined, false):', parseBool(undefined, false));
console.log('parseBool(undefined, true):', parseBool(undefined, true));
console.log('parseBool(" true", false):', parseBool(' true', false));
console.log('parseBool("\tFALSE  ", true):', parseBool('\tFALSE  ', true));
console.log('parseBool("on", true):', parseBool('on', true));
console.log('parseBool("on", false):', parseBool('on', false));

// Test constants
console.log('HAS_BLOBS:', HAS_BLOBS);
console.log('STT_TTS_ENABLED:', STT_TTS_ENABLED);
console.log('flags:', flags);

console.log('All tests completed!');
