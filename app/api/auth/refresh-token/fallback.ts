/**
 * Fallback implementation for token retrieval
 * This is used when Python script execution fails or is not available
 */

import fs from 'fs';
import path from 'path';

// Simple in-memory cache
let cachedToken = process.env.OPENAI_API_KEY || null;

export async function getFallbackToken(): Promise<string> {
  if (cachedToken) {
    return cachedToken;
  }
  
  // Check if there's a .env file with the token
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/OPENAI_API_KEY=([^\r\n]+)/);
      if (match && match[1]) {
        cachedToken = match[1];
        console.log('Using OPENAI_API_KEY from .env.local file');
        return cachedToken;
      }
    }
  } catch (error) {
    console.warn('Error reading .env.local file:', error);
  }
  
  // If still no token, throw an error
  if (!cachedToken) {
    throw new Error('No token available in environment variables or .env.local');
  }
  
  return cachedToken;
} 