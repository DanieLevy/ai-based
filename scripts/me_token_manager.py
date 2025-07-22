#!/usr/bin/env python3
import os
import json
import time
import sys
import traceback
from pathlib import Path

"""
Token manager for Mobileye authentication
Handles token generation, caching, and refreshing
"""

# Define token cache file location - in user's home directory to avoid git commits
CACHE_DIR = Path.home() / '.me_tokens'
CACHE_FILE = CACHE_DIR / 'token_cache.json'
TOKEN_EXPIRY_BUFFER = 300  # Refresh token 5 minutes before it expires

def setup_cache_dir():
    """Create cache directory if it doesn't exist"""
    CACHE_DIR.mkdir(exist_ok=True)

def get_cached_token():
    """Get token from cache if valid"""
    if not CACHE_FILE.exists():
        return None
    
    try:
        with open(CACHE_FILE, 'r') as f:
            cache = json.load(f)
        
        # Check if token is still valid (with buffer time)
        if cache['expiry'] > time.time() + TOKEN_EXPIRY_BUFFER:
            return cache['token']
    except Exception as e:
        # If any error occurs with the cache, ignore and fetch a new token
        print(f"Cache error: {str(e)}", file=sys.stderr)
    
    return None

def save_token_to_cache(token, expiry):
    """Save token and expiry to cache"""
    setup_cache_dir()
    
    try:
        with open(CACHE_FILE, 'w') as f:
            json.dump({
                'token': token,
                'expiry': expiry,
                'created_at': time.time()
            }, f)
    except Exception as e:
        print(f"Failed to save token to cache: {str(e)}", file=sys.stderr)

def get_token_expiry(token):
    """
    Extract token expiry time from JWT token
    Returns timestamp or current time + 1 hour if parsing fails
    """
    try:
        from me_auth_client.jwt_util import get_jwt_payload
        payload = get_jwt_payload(token)
        return payload.get('exp', int(time.time()) + 3600)
    except Exception:
        # Default expiry if we can't parse the token
        return int(time.time()) + 3600

def get_fresh_token():
    """Get a fresh token from meezeh_app"""
    try:
        from me_auth_client import meezeh_app
        token = meezeh_app.get_token_with_device_flow_fallback()
        expiry = get_token_expiry(token)
        save_token_to_cache(token, expiry)
        return token
    except ImportError:
        print("ERROR: me_auth_client module not found. Please install it.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: Failed to get token: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

def get_token():
    """
    Main function to get a token - checks cache first, then gets fresh token if needed
    Returns the token as a string
    """
    token = get_cached_token()
    if token:
        return token
    
    return get_fresh_token()

if __name__ == "__main__":
    try:
        # Output just the token for easy parsing by the calling process
        print(get_token())
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1) 