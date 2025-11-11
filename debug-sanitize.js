const input = 'file<>:"|?*.txt';
console.log('Input:', input);
console.log('Input length:', input.length);

// Test each character individually
const specialChars = '<>:"|?*';
specialChars.split('').forEach((char) => {
  const regex = new RegExp('[' + char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ']', 'g');
  const replaced = input.replace(regex, '_');
  const isReplaced = replaced !== input;
  console.log(
    `'${char}' (code ${char.charCodeAt(0)}): ${isReplaced ? 'REPLACED' : 'NOT REPLACED'}`,
  );
});

// Test current regex
const currentRegex = /[<>"|?*]/g;
const currentResult = input.replace(currentRegex, '_');
console.log('Current regex result:', currentResult);

// Test with colon separately
const withColon = currentResult.replace(/:/g, '_');
console.log('With colon replacement:', withColon);
console.log('Expected: file______.txt');
console.log('Match:', withColon === 'file______.txt');
