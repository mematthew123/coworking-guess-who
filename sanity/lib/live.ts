import { defineLive } from "next-sanity";
import { client } from './client'

// Optimized configuration for real-time updates
export const { sanityFetch, SanityLive } = defineLive({ 
  client: client.withConfig({ 
    // Use stable API version
    apiVersion: 'vX',
    // CRITICAL: Disable CDN for real-time
    useCdn: false,
    // Ensure credentials are included
    withCredentials: true,
    // Use published perspective for consistency
    perspective: 'published',
    // Result source header for debugging
    resultSourceMap: false,
  }),
  // Cache configuration for real-time
  fetchOptions: {
    revalidate: 0
  },
  // Enable automatic revalidation
  
})