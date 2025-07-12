const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env' });

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
        status
      }
    `);
    
    if (activeGames.length === 0) {
      console.log('No active games found.');
      return;
    }
    
    console.log(`Found ${activeGames.length} active games to abandon.\n`);
    
    // Process in batches to avoid timeout
    const batchSize = 50;
    const totalBatches = Math.ceil(activeGames.length / batchSize);
    
    console.log(`Processing in ${totalBatches} batches of ${batchSize} games each...\n`);
    
    for (let i = 0; i < activeGames.length; i += batchSize) {
      const batch = activeGames.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} games)...`);
      
      // Create transaction for batch
      const transaction = client.transaction();
      
      for (const game of batch) {
        transaction.patch(game._id, {
          set: {
            status: 'abandoned',
            endedAt: new Date().toISOString()
          }
        });
      }
      
      try {
        await transaction.commit();
        console.log(`✓ Batch ${batchNumber} completed successfully\n`);
      } catch (error) {
        console.error(`✗ Batch ${batchNumber} failed:`, error.message);
        console.log('Retrying games individually...');
        
        // Retry failed batch one by one
        for (const game of batch) {
          try {
            await client
              .patch(game._id)
              .set({ 
                status: 'abandoned',
                endedAt: new Date().toISOString()
              })
              .commit();
            console.log(`  ✓ Abandoned game ${game._id}`);
          } catch (err) {
            console.error(`  ✗ Failed to abandon game ${game._id}:`, err.message);
          }
        }
        console.log('');
      }
    }
    
    console.log(`\nDone! Processed ${activeGames.length} games.`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
abandonAllActiveGames();