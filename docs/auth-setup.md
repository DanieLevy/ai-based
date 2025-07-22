# Dynamic Authentication Setup

This project uses Mobileye's authentication system to generate dynamic API tokens for the Sofia API. The tokens are automatically refreshed when they expire.

## Prerequisites

- Python 3.6+ installed and available in your PATH
- Access to the `me-auth-client` Python package
- Access to the Sofia API

## Setup

Run the setup script to ensure all dependencies are installed:

```bash
npm run setup-auth
```

This will:
1. Check if Python is installed
2. Verify or install the `me-auth-client` package
3. Ensure the token manager script is available

## How It Works

The system works in layers:

1. **Python Token Manager (`me_token_manager.py`)**
   - Handles the direct interaction with `me_auth_client`
   - Caches tokens locally to avoid frequent authentication
   - Manages token expiry and refresh

2. **API Endpoint (`/api/auth/refresh-token`)**
   - Provides a secure way for the frontend to get tokens
   - Calls the Python script to get fresh tokens when needed
   - Caches tokens in memory to minimize Python script calls

3. **JavaScript Client (`getSofiaToken()`)**
   - Frontend utility to get tokens from the API
   - Handles token caching and expiry in the browser
   - Used by the AI client to authenticate requests

## Usage

The system is designed to work transparently. The AI client will automatically get fresh tokens when needed.

### Manual Testing

To test token acquisition manually:

1. Run the Python script directly:
   ```bash
   python scripts/me_token_manager.py
   ```

2. Call the API endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/auth/refresh-token
   ```

## Troubleshooting

### Common Issues

1. **Python not found**
   - Ensure Python is installed and in your PATH
   - Try running `python --version` to confirm

2. **me-auth-client package not found**
   - Run `pip install me-auth-client` manually
   - Check for any errors during installation

3. **Token acquisition fails**
   - Check your network connection and VPN status
   - Ensure you have proper permissions for the Sofia API
   - Try running the Python script directly for detailed error messages

### Logs

Check for error messages in:
- Server console logs (for API endpoint issues)
- Browser console logs (for frontend token issues)
- Python script output (for authentication issues)

## Security Considerations

- Tokens are cached in memory and in a local file
- The token cache file is stored outside the project directory
- The API endpoint requires authentication (to be implemented)
- Tokens are never exposed in the browser network traffic 