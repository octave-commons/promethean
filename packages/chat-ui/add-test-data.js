import { ContextStore } from '@promethean/persistence';

async function addTestData() {
  console.log('Creating ContextStore with AGENT_NAME="duck"...');
  const contextStore = new ContextStore((ms) => new Date(ms).toISOString(), 'duck');

  try {
    console.log('Getting or creating collection...');
    const collection = await contextStore.getOrCreateCollection('default');
    console.log('Collection created/retrieved:', collection.name);

    // Add some test conversations
    const testConversations = [
      {
        text: 'Hello! Can you help me understand how the ContextStore works?',
        metadata: {
          userName: 'User',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
      },
      {
        text: "I'd be happy to help! The ContextStore is a system for managing conversation data with both MongoDB and ChromaDB backends.",
        metadata: {
          userName: 'duck',
          timestamp: new Date(Date.now() - 86300000).toISOString(), // 1 day ago + small offset
        },
      },
      {
        text: 'That sounds interesting. What are the main benefits?',
        metadata: {
          userName: 'User',
          timestamp: new Date(Date.now() - 86200000).toISOString(),
        },
      },
      {
        text: 'The main benefits include persistent storage, semantic search capabilities, and efficient retrieval of both recent and relevant conversations.',
        metadata: {
          userName: 'duck',
          timestamp: new Date(Date.now() - 86100000).toISOString(),
        },
      },
      {
        text: 'How do I get started with building a web application?',
        metadata: {
          userName: 'User',
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        },
      },
      {
        text: "Great question! To build a web application, you'll need to choose a frontend framework, backend technology, and database. What type of app are you planning to build?",
        metadata: {
          userName: 'duck',
          timestamp: new Date(Date.now() - 172700000).toISOString(),
        },
      },
      {
        text: "I'm getting an error with my React components",
        metadata: {
          userName: 'User',
          timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        },
      },
      {
        text: 'I can help you debug React issues! Could you share the error message and the relevant component code?',
        metadata: {
          userName: 'duck',
          timestamp: new Date(Date.now() - 259100000).toISOString(),
        },
      },
    ];

    console.log('Adding test conversations...');
    for (const conv of testConversations) {
      await collection.add(conv.text, conv.metadata);
      console.log(`Added: ${conv.text.substring(0, 50)}...`);
    }

    console.log('Test data added successfully!');

    // Verify the data was added
    console.log('\nVerifying data...');
    const latestDocs = await contextStore.getLatestDocuments(10);
    console.log(`Found ${latestDocs.length} documents in the store`);

    latestDocs.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.metadata?.userName}: ${doc.text.substring(0, 50)}...`);
    });
  } catch (error) {
    console.error('Error adding test data:', error);
    console.log('This might be expected if MongoDB/ChromaDB are not running.');
  }
}

addTestData()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
