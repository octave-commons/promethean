// Test TypeScript in clj-hacks directory
interface TestInterface {
  name: string;
  value: number;
}

const test: TestInterface = {
  name: 'test',
  value: 'wrong', // Type error
};
