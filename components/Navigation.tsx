'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';

export default function Navigation() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
  const navItems = [
    { name: 'Directory', path: '/directory' },
    { name: 'Leaderboard', path: '/leader-board' },
    { name: 'Community Games', path: '/games' },
    { name: 'Profile', path: '/profile' }
  ];
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <nav className="bg-white shadow relative">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Coworking Guess Who
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const isActive = 
                  pathname === item.path || 
                  (item.path !== '/' && pathname?.startsWith(item.path));
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Desktop Auth */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoaded && (
              <div>
                {isSignedIn ? (
                  <UserButton afterSignOutUrl="/" />
                ) : (
                  <SignInButton mode="modal">
                    <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                )}
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`sm:hidden transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="bg-white border-t border-gray-200 shadow-lg">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const isActive = 
                pathname === item.path || 
                (item.path !== '/' && pathname?.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`block pl-4 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          {/* Mobile Auth */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isLoaded && (
              <div className="px-4">
                {isSignedIn ? (
                  <div className="flex items-center">
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-800 mb-2">Account</div>
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <button className="w-full text-left text-blue-600 hover:text-blue-800 font-medium py-2 transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}