"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { 
  Navbar, 
  NavBody, 
  NavbarLogo, 
  NavbarButton, 
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu
} from "./ui/resizable-navbar";
import { navigationItems } from "./navigation-config";

export function HeaderWithNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <>
      {/* Desktop Navigation */}
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navigationItems} />
          <div className="relative z-20 flex items-center">
            <ThemeToggle />
            <NavbarButton href="/api/ai/models" className="ml-4" variant="primary">
              View Models
            </NavbarButton>
          </div>
        </NavBody>
        
        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <MobileNavToggle 
                isOpen={mobileMenuOpen} 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              />
            </div>
          </MobileNavHeader>
          
          <MobileNavMenu 
            isOpen={mobileMenuOpen} 
            onClose={() => setMobileMenuOpen(false)}
          >
            {navigationItems.map((item, idx) => (
              <Link 
                key={idx} 
                href={item.link}
                className="w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            <NavbarButton href="/api/ai/models" className="mt-2" variant="gradient">
              View Models
            </NavbarButton>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </>
  );
} 