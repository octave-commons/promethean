const { loadString } = await import('nbb');

// Test basic Clojure evaluation
const testCode = `
  (let [task-obj #js {"title" "test" "uuid" "test-uuid"}
        board-obj #js {"columns" []}]
    (println "Task object:" task-obj)
    (println "Board object:" board-obj)
    true)
`;

try {
  const result = await loadString(testCode, {
    context: 'cljs.user',
    print: console.log,
  });
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error);
}
