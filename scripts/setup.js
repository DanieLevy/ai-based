#!/usr/bin/env node

/**
 * Setup script for the Mobileye Auth integration
 * This script ensures the Python dependencies are installed
 * and the token manager is ready to use
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Setting up Mobileye Auth integration...');

// Check if Python is installed
function checkPython() {
  return new Promise((resolve, reject) => {
    const python = spawn('python', ['--version']);
    
    python.on('error', (error) => {
      console.error('Error checking Python:', error.message);
      reject(new Error('Python is not installed or not in PATH'));
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Python check failed with code ${code}`));
      }
    });
  });
}

// Run the setup script
function setupMeAuth() {
  return new Promise((resolve, reject) => {
    const setupScript = path.join(__dirname, 'setup_me_auth.py');
    
    // Check if script exists
    if (!fs.existsSync(setupScript)) {
      reject(new Error(`Setup script not found at ${setupScript}`));
      return;
    }
    
    console.log('Running Python setup script...');
    
    const setup = spawn('python', [setupScript]);
    
    setup.stdout.on('data', (data) => {
      console.log(data.toString().trim());
    });
    
    setup.stderr.on('data', (data) => {
      console.error(data.toString().trim());
    });
    
    setup.on('error', (error) => {
      console.error('Error running setup script:', error.message);
      reject(error);
    });
    
    setup.on('close', (code) => {
      if (code === 0) {
        console.log('Setup completed successfully!');
        resolve(true);
      } else {
        reject(new Error(`Setup failed with code ${code}`));
      }
    });
  });
}

// Check if token manager exists
function checkTokenManager() {
  const tokenManager = path.join(__dirname, 'me_token_manager.py');
  
  if (!fs.existsSync(tokenManager)) {
    throw new Error(`Token manager not found at ${tokenManager}`);
  }
  
  console.log('Token manager found!');
}

// Run all setup steps
async function run() {
  try {
    await checkPython();
    await setupMeAuth();
    checkTokenManager();
    
    console.log('\nSetup successful! You can now use the dynamic token system.');
    console.log('To test the token acquisition, run:');
    console.log('  python scripts/me_token_manager.py');
    
    process.exit(0);
  } catch (error) {
    console.error('\nSetup failed:', error.message);
    console.error('\nPlease fix the issues and try again.');
    process.exit(1);
  }
}

run(); 