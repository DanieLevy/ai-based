/**
 * Mobileye Authentication Utility
 * Handles acquiring and refreshing tokens for the Sofia API
 */

// In-memory token cache for client-side
interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;
const TOKEN_EXPIRY_BUFFER = 600; // 10 minutes buffer

/**
 * Get a valid authentication token for Sofia API
 * Uses cached token if valid, otherwise fetches a fresh one
 */
export async function getSofiaToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  // Use cached token if still valid
  if (tokenCache && tokenCache.expiresAt > now + TOKEN_EXPIRY_BUFFER) {
    return tokenCache.token;
  }
  
  try {
    // Determine if we're running on client or server side
    const isServer = typeof window === 'undefined';
    
    // Construct appropriate URL for server or client
    const baseUrl = isServer 
      ? process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      : '';
    
    // Fetch token from API with appropriate URL
    const url = `${baseUrl}/api/auth/refresh-token`;
    console.log(`Fetching token from: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // Add 10 second timeout to avoid hanging requests
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.token) {
      throw new Error('Invalid token response from server');
    }
    
    const token = data.token;
    
    // Try to parse the token to get expiry
    try {
      // Split token and decode middle section (payload)
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      // Add padding if needed
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
      
      // Parse payload
      const payload = JSON.parse(Buffer.from(paddedBase64, 'base64').toString());
      const expiresAt = payload.exp || (Math.floor(Date.now() / 1000) + 3600);
      
      // Update cache
      tokenCache = {
        token,
        expiresAt
      };
    } catch (error) {
      console.warn('Error parsing token:', error);
      // Still use the token even if we can't parse it
      // Default expiry to 1 hour from now
      tokenCache = {
        token,
        expiresAt: Math.floor(Date.now() / 1000) + 3600
      };
    }
    
    return token;
  } catch (error) {
    console.error('Token acquisition error:', error);
    
    // Fallback to environment variable if available
    if (typeof process !== 'undefined' && process.env && process.env.OPENAI_API_KEY) {
      console.warn('Falling back to OPENAI_API_KEY environment variable');
      return process.env.OPENAI_API_KEY;
    }
    
    // For client side, try to read token from localStorage as last resort
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedToken = window.localStorage.getItem('sofia_api_key');
      if (savedToken) {
        console.warn('Using token from localStorage');
        return savedToken;
      }
    }
    
    throw new Error('Failed to get authentication token: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Clear the token cache, forcing a fresh token on next request
 */
export function clearTokenCache() {
  tokenCache = null;
} 