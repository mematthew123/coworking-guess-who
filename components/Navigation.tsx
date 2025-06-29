'use client';

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
        { name: 'DIRECTORY', path: '/directory' },
        { name: 'LEADERBOARD', path: '/leader-board' },
        { name: 'GAMES', path: '/games' },
        { name: 'PROFILE', path: '/profile' },
    ];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className='bg-yellow border-b-8 border-black relative z-50'>
            <div className='container py-6 mx-auto px-4'>
                <div className='flex justify-between h-20'>
                    <div className='flex'>
                        <div className='flex-shrink-0 flex items-center'>
                            <Link
                                href='/'
                                className='text-xl font-black uppercase bg-black text-yellow px-3 py-1 shadow-brutal-sm hover:shadow-brutal-md hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-100'
                            >
                                GUESS WHO?!
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className='hidden lg:ml-12 lg:flex lg:space-x-4'>
                            {navItems.map((item, index) => {
                                const isActive =
                                    pathname === item.path ||
                                    (item.path !== '/' &&
                                        pathname?.startsWith(item.path));

                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={`inline-flex items-center px-4 py-2 text-base font-black uppercase transition-all duration-100 transform hover:translate-x-[-2px] hover:translate-y-[-2px] ${
                                            isActive
                                                ? 'bg-pink text-white border-4 border-black shadow-brutal-md'
                                                : 'bg-white text-black border-4 border-black shadow-brutal-sm hover:shadow-brutal-md'
                                        } ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'}`}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Desktop Auth */}
                    <div className='hidden lg:flex lg:items-center'>
                        {isLoaded && (
                            <div>
                                {isSignedIn ? (
                                    <div className='bg-white border-4 border-black p-2 shadow-brutal-sm'>
                                        <UserButton afterSignOutUrl='/' />
                                    </div>
                                ) : (
                                    <SignInButton mode='modal'>
                                        <button className='bg-green text-black font-black uppercase px-4 py-2 border-4 border-black shadow-brutal-sm hover:shadow-brutal-md hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-100'>
                                            SIGN IN →
                                        </button>
                                    </SignInButton>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className='flex items-center lg:hidden'>
                        <button
                            onClick={toggleMobileMenu}
                            className='bg-black text-yellow p-3 border-4 border-yellow hover:bg-yellow hover:text-black transition-colors duration-100'
                            aria-label='Toggle mobile menu'
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className='sr-only'>Open main menu</span>
                            {isMobileMenuOpen ? (
                                <svg
                                    className='block h-8 w-8'
                                    xmlns='http://www.w3.org/2000/svg'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                    strokeWidth={4}
                                >
                                    <path
                                        strokeLinecap='square'
                                        strokeLinejoin='miter'
                                        d='M6 18L18 6M6 6l12 12'
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className='block h-8 w-8'
                                    xmlns='http://www.w3.org/2000/svg'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                    strokeWidth={4}
                                >
                                    <path
                                        strokeLinecap='square'
                                        strokeLinejoin='miter'
                                        d='M4 6h16M4 12h16M4 18h16'
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div
                className={`lg:hidden absolute left-0 right-0 top-full bg-yellow border-b-8 border-black transition-all duration-100 ${
                    isMobileMenuOpen
                        ? 'translate-y-0 opacity-100'
                        : '-translate-y-full opacity-0 pointer-events-none'
                }`}
            >
                <div className='border-t-4 border-black'>
                    <div className='py-4 space-y-3 px-4'>
                        {navItems.map((item) => {
                            const isActive =
                                pathname === item.path ||
                                (item.path !== '/' &&
                                    pathname?.startsWith(item.path));

                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`block px-4 py-3 text-base font-black uppercase border-4 border-black transition-all duration-100 ${
                                        isActive
                                            ? 'bg-pink text-white shadow-brutal-md translate-x-2'
                                            : 'bg-white text-black shadow-brutal-sm hover:shadow-brutal-md hover:translate-x-2'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Auth */}
                    <div className='px-4 pb-4'>
                        {isLoaded && (
                            <div>
                                {isSignedIn ? (
                                    <div className='bg-white border-4 border-black p-4 shadow-brutal-sm'>
                                        <div className='text-lg font-black uppercase mb-3'>
                                            ACCOUNT
                                        </div>
                                        <UserButton afterSignOutUrl='/' />
                                    </div>
                                ) : (
                                    <SignInButton mode='modal'>
                                        <button className='w-full bg-green text-black font-black uppercase px-4 py-3 border-4 border-black shadow-brutal-md hover:shadow-brutal-lg hover:translate-x-[-2px] transition-all duration-100'>
                                            SIGN IN →
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
