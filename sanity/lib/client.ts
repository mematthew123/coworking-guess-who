import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

// Main client for server-side operations
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false, // ✅ No caching for real-time
  perspective: 'published',
})

// Browser client for subscriptions - ensure no CDN
export const browserClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // ✅ Critical for real-time
  withCredentials: true,
  perspective: 'published',
})

// You might also want to create a dedicated real-time client
export const realtimeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // ✅ Never use CDN for real-time
  withCredentials: true,
  perspective: 'published',
  // Optimize for real-time
  ignoreBrowserTokenWarning: true,
})