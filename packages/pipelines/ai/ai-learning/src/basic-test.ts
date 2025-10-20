// Basic test to verify the setup works
console.log('Testing basic setup...');

async function basicTest() {
  console.log('✅ Basic test works!');
  return true;
}

basicTest()
  .then(() => {
    console.log('✅ Test completed successfully');
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
  });
