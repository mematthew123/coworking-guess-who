'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';

export default function Navigation() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Community Games', path: '/games' },
    { name: 'Profile', path: '/profile' }
  ];
  
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Coworking Guess Who
              </Link>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const isActive = 
                  pathname === item.path || 
                  (item.path !== '/' && pathname?.startsWith(item.path));
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
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
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoaded && (
              <div>
                {isSignedIn ? (
                  <UserButton afterSignOutUrl="/" />
                ) : (
                  <SignInButton mode="modal">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Sign In
                    </button>
                  </SignInButton>
                )}
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none">
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}