// Test script to verify chat real-time updates
// Run this script to send a test chat message to a game

const sanityClient = require('@sanity/client');

const client = sanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2021-03-25',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function sendTestMessage(gameId) {
  try {
    const testMessage = {
      _key: `test-${Date.now()}`,
      senderId: 'test-user',
      senderName: 'Test User',
      message: [
        {
          _type: 'block',
          _key: Date.now().toString(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 's1',
              text: `Test message sent at ${new Date().toLocaleTimeString()}`
            }
          ]
        }
      ],
      timestamp: new Date().toISOString()
    };

    const result = await client
      .patch(gameId)
      .setIfMissing({ chat: [] })
      .append('chat', [testMessage])
      .commit();

    console.log('Test message sent successfully:', result._id);
    console.log('Message details:', testMessage);
  } catch (error) {
    console.error('Error sending test message:', error);
  }
}

// Usage: node test-chat-update.js <gameId>
const gameId = process.argv[2];
if (!gameId) {
  console.error('Please provide a game ID as argument');
  console.log('Usage: node test-chat-update.js <gameId>');
  process.exit(1);
}

sendTestMessage(gameId);