#!/usr/bin/env python3
"""
Setup script for Mobileye authentication
Checks if me_auth_client is installed and installs it if needed
"""

import sys
import subprocess
import pkg_resources

def check_package(package_name):
    """Check if a package is installed"""
    try:
        pkg_resources.get_distribution(package_name)
        return True
    except pkg_resources.DistributionNotFound:
        return False

def install_package(package_name):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package_name])
        return True
    except subprocess.CalledProcessError:
        return False

def main():
    """Check and install required packages"""
    package = "me-auth-client"
    
    print(f"Checking for {package}...")
    
    if check_package(package):
        print(f"{package} is already installed.")
        return True
    
    print(f"{package} not found. Attempting to install...")
    
    if install_package(package):
        print(f"Successfully installed {package}.")
        return True
    else:
        print(f"Failed to install {package}.")
        print("You may need to install it manually:")
        print(f"  pip install {package}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 