import { MongoClient } from 'mongodb';

async function testMongoConnection() {
  console.log('Testing MongoDB connection...');

  const MONGO_URI =
    process.env.MONGODB_URI ?? process.env.MCP_MONGO_URI ?? 'mongodb://localhost:27017';
  console.log(`Using URI: ${MONGO_URI}`);

  try {
    // Test 1: Direct connection
    console.log('\n=== Test 1: Direct Connection ===');
    const client1 = new MongoClient(MONGO_URI);
    await client1.connect();
    console.log('✅ Client 1 connected');

    const ping1 = await client1.db('admin').command({ ping: 1 });
    console.log('✅ Ping 1 successful:', ping1);

    // Test 2: Database operations
    console.log('\n=== Test 2: Database Operations ===');
    const db = client1.db('test_database');
    const collection = db.collection('test_collection');

    const testDoc = { test: 'document', timestamp: new Date() };
    const insertResult = await collection.insertOne(testDoc);
    console.log('✅ Insert successful:', insertResult.insertedId);

    const findResult = await collection.findOne({ _id: insertResult.insertedId });
    console.log('✅ Find successful:', findResult);

    // Test 3: Multiple operations
    console.log('\n=== Test 3: Multiple Operations ===');
    for (let i = 0; i < 5; i++) {
      const result = await client1.db('admin').command({ ping: 1 });
      console.log(`✅ Ping ${i + 1} successful`);
    }

    // Test 4: Connection state check
    console.log('\n=== Test 4: Connection State ===');
    console.log('Topology exists:', !!client1.topology);
    console.log('Topology connected:', client1.topology?.isConnected?.());

    await client1.close();
    console.log('✅ Connection closed');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMongoConnection();
