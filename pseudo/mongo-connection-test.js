import { MongoClient } from 'mongodb';

const MONGO_URI =
  process.env.MONGODB_URI ?? process.env.MCP_MONGO_URI ?? 'mongodb://localhost:27017';

async function testConnection() {
  console.log('Testing MongoDB connection...');

  try {
    // Test 1: Basic connection
    console.log('1. Creating client...');
    const client = new MongoClient(MONGO_URI, {
      maxPoolSize: 1,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 5000,
    });

    console.log('2. Connecting...');
    await client.connect();
    console.log('3. Connected successfully');

    // Test 2: Ping
    console.log('4. Pinging...');
    await client.db('admin').command({ ping: 1 });
    console.log('5. Ping successful');

    // Test 3: Access database
    console.log('6. Accessing database...');
    const db = client.db('database');
    console.log('7. Database accessed');

    // Test 4: Access collection
    console.log('8. Accessing collection...');
    const collection = db.collection('duck_duck_eventStore');
    console.log('9. Collection accessed');

    // Test 5: Perform operation
    console.log('10. Performing findOne...');
    const result = await collection.findOne({});
    console.log('11. findOne successful:', result);

    // Test 6: Insert operation
    console.log('12. Performing insert...');
    await collection.insertOne({
      test: 'document',
      timestamp: new Date(),
      id: 'test-' + Date.now(),
    });
    console.log('13. insert successful');

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error constructor:', error.constructor?.name);
  } finally {
    process.exit(0);
  }
}

testConnection();
