import { ApifyClient } from 'apify-client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { formatLinkedInProfile, formatLinkedInPosts } from './formatters';

// Load environment variables
dotenv.config();

const APIFY_API_TOKEN = process.env.APIFY_API;
const LINKEDIN_PROFILE_URL = process.env.LINKEDIN_PROFILE_URL || 'https://www.linkedin.com/in/vitosenic';

if (!APIFY_API_TOKEN) {
  throw new Error('APIFY_API environment variable is not set.');
}

// Extract username from LinkedIn URL
function extractUsername(url: string): string {
  const match = url.match(/linkedin\.com\/in\/([^/?]+)/);
  if (!match || !match[1]) {
    throw new Error(`Invalid LinkedIn URL format: ${url}. Expected format: https://www.linkedin.com/in/username`);
  }
  return match[1];
}

// Initialize Apify client
const client = new ApifyClient({
  token: APIFY_API_TOKEN,
});

// Paths for output files
const CONTENT_DIR = path.join(process.cwd(), 'public', 'content');
const PROFILE_OUTPUT = path.join(CONTENT_DIR, 'linkedin_profile.json');
const POSTS_OUTPUT = path.join(CONTENT_DIR, 'linkedin_posts.json');

// Ensure content directory exists
if (!fs.existsSync(CONTENT_DIR)) {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
}

/**
 * Fetches LinkedIn profile data from Apify using ApifyClient
 */
async function fetchLinkedInProfile(): Promise<void> {
  console.log('🔍 Fetching LinkedIn profile data...');
  console.log(`Profile URL: ${LINKEDIN_PROFILE_URL}`);

  try {
    const username = extractUsername(LINKEDIN_PROFILE_URL);
    console.log(`   Username: ${username}`);

    // Prepare Actor input
    const input = {
      username: username,
      includeEmail: false,
    };

    // Run the Actor and wait for it to finish
    console.log('   Running Actor...');
    const run = await client.actor('VhxlqQXRwhW8H5hNV').call(input);

    // Fetch results from the run's dataset
    console.log('   Fetching results from dataset...');
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      throw new Error('No profile data returned from Apify');
    }

    // Save raw JSON
    const profileData = items[0] as any;
    fs.writeFileSync(PROFILE_OUTPUT, JSON.stringify(profileData, null, 2), 'utf-8');
    
    // Also save formatted version
    const formattedProfile = formatLinkedInProfile(profileData);
    const formattedProfilePath = path.join(CONTENT_DIR, 'linkedin_profile.txt');
    fs.writeFileSync(formattedProfilePath, formattedProfile, 'utf-8');
    
    console.log(`✅ LinkedIn profile data saved to ${PROFILE_OUTPUT}`);
    console.log(`✅ Formatted profile saved to ${formattedProfilePath}`);
    console.log(`   Profile: ${profileData.basic_info?.fullname || profileData.fullName || profileData.name || 'Unknown'}`);
  } catch (error) {
    console.error('❌ Error fetching LinkedIn profile:', error);
    throw error;
  }
}

/**
 * Fetches LinkedIn posts from Apify using ApifyClient
 */
async function fetchLinkedInPosts(): Promise<void> {
  console.log('🔍 Fetching LinkedIn posts...');
  console.log(`Profile URL: ${LINKEDIN_PROFILE_URL}`);

  try {
    const username = extractUsername(LINKEDIN_PROFILE_URL);
    console.log(`   Username: ${username}`);

    // Prepare Actor input
    const input = {
      username: username,
      page_number: 1,
      limit: 100,
    };

    // Run the Actor and wait for it to finish
    console.log('   Running Actor...');
    const run = await client.actor('LQQIXN9Othf8f7R5n').call(input);

    // Fetch results from the run's dataset
    console.log('   Fetching results from dataset...');
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || !Array.isArray(items)) {
      throw new Error('No posts data returned from Apify');
    }

    // Save raw JSON
    fs.writeFileSync(POSTS_OUTPUT, JSON.stringify(items, null, 2), 'utf-8');
    
    // Also save formatted version
    const formattedPosts = formatLinkedInPosts(items);
    const formattedPostsPath = path.join(CONTENT_DIR, 'linkedin_posts.txt');
    fs.writeFileSync(formattedPostsPath, formattedPosts, 'utf-8');
    
    console.log(`✅ LinkedIn posts saved to ${POSTS_OUTPUT}`);
    console.log(`✅ Formatted posts saved to ${formattedPostsPath}`);
    console.log(`   Found ${items.length} posts`);
  } catch (error) {
    console.error('❌ Error fetching LinkedIn posts:', error);
    throw error;
  }
}

/**
 * Main function to fetch both profile and posts
 */
async function main() {
  console.log('🚀 Starting LinkedIn data fetch from Apify...\n');

  try {
    // Fetch profile
    await fetchLinkedInProfile();
    console.log('');

    // Fetch posts
    await fetchLinkedInPosts();
    console.log('');

    console.log('✅ All LinkedIn data fetched successfully!');
  } catch (error) {
    console.error('\n❌ Failed to fetch LinkedIn data:', error);
    process.exit(1);
  }
}

// Run main function when script is executed directly
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

export { fetchLinkedInProfile, fetchLinkedInPosts };

