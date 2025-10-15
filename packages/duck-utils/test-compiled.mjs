// Test file to verify compiled ClojureScript works
import './dist/promethean.duck_utils.flags.js';

console.log('Testing compiled ClojureScript...');

// The compiled code exports to global scope via goog.exportSymbol
// So we need to access them from the global object

// Test parseBool function
console.log('globalThis.parseBool(undefined, false):', globalThis.parseBool(undefined, false));
console.log('globalThis.parseBool(undefined, true):', globalThis.parseBool(undefined, true));
console.log('globalThis.parseBool(" true", false):', globalThis.parseBool(' true', false));
console.log('globalThis.parseBool("\tFALSE  ", true):', globalThis.parseBool('\tFALSE  ', true));
console.log('globalThis.parseBool("on", true):', globalThis.parseBool('on', true));
console.log('globalThis.parseBool("on", false):', globalThis.parseBool('on', false));

// Test constants
console.log('globalThis.HAS_BLOBS:', globalThis.HAS_BLOBS);
console.log('globalThis.STT_TTS_ENABLED:', globalThis.STT_TTS_ENABLED);
console.log('globalThis.flags:', globalThis.flags);

console.log('All tests completed!');
