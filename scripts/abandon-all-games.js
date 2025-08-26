const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env' });

console.log('Environment check:');
console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET);
console.log('Token exists:', !!process.env.SANITY_API_TOKEN);
console.log('');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function abandonAllActiveGames() {
  try {
    console.log('Fetching all active games...');
    
    // Query for all games that are not completed or abandoned
    const activeGames = await client.fetch(`
      *[_type == "game" && status in ["waiting", "active"]] {
        _id,
        status,
        playerOne->{name},
        playerTwo->{name},
        createdAt
      }
    `);
    
    if (activeGames.length === 0) {
      console.log('No active games found.');
      return;
    }
    
    console.log(`Found ${activeGames.length} active games to abandon:\n`);
    
    // Display games that will be abandoned
    activeGames.forEach((game) => {
      console.log(`- Game ${game._id}:`);
      console.log(`  Status: ${game.status}`);
      console.log(`  Players: ${game.playerOne?.name || 'Unknown'} vs ${game.playerTwo?.name || 'Pending'}`);
      console.log(`  Created: ${new Date(game.createdAt).toLocaleString()}\n`);
    });
    
    // Confirm before proceeding
    console.log('This will mark all these games as abandoned.');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Update all games to abandoned status
    console.log('Abandoning games...\n');
    
    for (const game of activeGames) {
      try {
        await client
          .patch(game._id)
          .set({ 
            status: 'abandoned',
            endedAt: new Date().toISOString()
          })
          .commit();
          
        console.log(`✓ Abandoned game ${game._id}`);
      } catch (error) {
        console.error(`✗ Failed to abandon game ${game._id}:`, error);
      }
    }
    
    console.log('\nDone! All active games have been abandoned.');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
abandonAllActiveGames();