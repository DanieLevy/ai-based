import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { getFallbackToken } from './fallback';

// Set a token cache to minimize Python script calls
interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;
const TOKEN_EXPIRY_BUFFER = 600; // 10 minutes buffer

/**
 * Get token from cache or Python script
 */
async function getToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  // Return cached token if valid
  if (tokenCache && tokenCache.expiresAt > now + TOKEN_EXPIRY_BUFFER) {
    console.log("Using cached token");
    return tokenCache.token;
  }

  // Get fresh token from Python script
  console.log("Fetching fresh token from Python script");
  
  const scriptPath = path.join(process.cwd(), 'scripts', 'me_token_manager.py');
  
  // If script doesn't exist, use fallback
  if (!fs.existsSync(scriptPath)) {
    console.log("Python script not found, using fallback");
    return getFallbackToken();
  }
  
  try {
    return new Promise<string>((resolve, reject) => {
      exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error('Token script execution error:', error);
          console.error('Script stderr:', stderr);
          
          // Try fallback instead of rejecting
          console.log("Python script failed, using fallback");
          getFallbackToken().then(resolve).catch(reject);
          return;
        }
        
        if (stderr) {
          console.warn('Script warnings:', stderr);
        }
        
        const token = stdout.trim();
        
        // Basic validation - check if it looks like a JWT
        if (!token || !token.includes('.') || token.split('.').length !== 3) {
          console.warn('Invalid token format returned from script, using fallback');
          getFallbackToken().then(resolve).catch(reject);
          return;
        }
        
        // Parse token to get expiry
        try {
          // JWT payload is in the middle section
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          const expiresAt = payload.exp || (Math.floor(Date.now() / 1000) + 3600); // Default 1 hour
          
          // Update cache
          tokenCache = {
            token,
            expiresAt
          };
          
          resolve(token);
        } catch (err) {
          console.error('Error parsing token:', err);
          // Still return the token even if we can't parse it
          resolve(token);
        }
      });
    });
  } catch (error) {
    console.error("Error executing Python script:", error);
    return getFallbackToken();
  }
}

/**
 * POST handler for token refresh
 */
export async function POST() {
  try {
    // Get token
    const token = await getToken();
    
    // Return the token
    return NextResponse.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Return error
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
} 

/**
 * GET handler for token status check (does not return the actual token)
 */
export async function GET() {
  try {
    // Get token without returning it
    await getToken();
    
    // Return success without exposing the token
    return NextResponse.json({
      success: true,
      tokenAvailable: true
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : String(error) 
    }, { 
      status: 500 
    });
  }
} 