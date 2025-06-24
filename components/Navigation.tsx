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
        { name: 'Directory', path: '/directory' },
        { name: 'Leaderboard', path: '/leader-board' },
        { name: 'Community Games', path: '/games' },
        { name: 'Profile', path: '/profile' },
    ];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className='bg-[var(--color-sidecar-cream)] shadow-md relative border-b border-[var(--color-gold-200)]'>
            <div className='container mx-auto px-4'>
                <div className='flex justify-between h-20'>
                    <div className='flex items-center'>
                        {/* Logo */}
                        <Link
                            href='/'
                            className='flex-shrink-0 flex items-center group'
                        >
                            <div className='ml-3 sm:block'>
                                <div className='font-script text-[var(--color-gold-600)] text-sm italic'>
                                    The
                                </div>
                                <div className='font-heading text-[var(--color-sidecar-gold)] text-lg font-bold tracking-widest uppercase -mt-1'>
                                    SIDECAR
                                </div>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className='hidden lg:ml-10 lg:flex lg:space-x-8'>
                            {navItems.map((item) => {
                                const isActive =
                                    pathname === item.path ||
                                    (item.path !== '/' &&
                                        pathname?.startsWith(item.path));

                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${
                                            isActive
                                                ? 'border-[var(--color-sidecar-gold)] text-[var(--color-sidecar-gold)]'
                                                : 'border-transparent text-[var(--color-sidecar-gray)] hover:text-[var(--color-sidecar-gold)] hover:border-[var(--color-gold-300)]'
                                        }`}
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
                                    <div className='flex items-center space-x-4'>
                                        <span className='text-sm text-[var(--color-sidecar-gray)]'>
                                            Welcome back
                                        </span>
                                        <UserButton
                                            afterSignOutUrl='/'
                                            appearance={{
                                                elements: {
                                                    avatarBox:
                                                        'w-10 h-10 border-2 border-[var(--color-gold-300)]',
                                                },
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <SignInButton mode='modal'>
                                        <button className='bg-[var(--color-sidecar-gold)] text-[var(--color-sidecar-cream)] px-6 py-2 rounded-full font-medium hover:bg-[var(--color-gold-600)] transition-colors duration-200 shadow-sm hover:shadow-md'>
                                            Sign In
                                        </button>
                                    </SignInButton>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className='-mr-2 flex items-center lg:hidden'>
                        <button
                            onClick={toggleMobileMenu}
                            className='inline-flex items-center justify-center p-2 rounded-md text-[var(--color-sidecar-gray)] hover:text-[var(--color-sidecar-gold)] hover:bg-[var(--color-gold-100)] focus:outline-none transition-colors duration-200'
                            aria-label='Toggle mobile menu'
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className='sr-only'>Open main menu</span>
                            {isMobileMenuOpen ? (
                                <svg
                                    className='block h-6 w-6'
                                    xmlns='http://www.w3.org/2000/svg'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M6 18L18 6M6 6l12 12'
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className='block h-6 w-6'
                                    xmlns='http://www.w3.org/2000/svg'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
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
                className={`lg:hidden transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen
                        ? 'max-h-96 opacity-100'
                        : 'max-h-0 opacity-0 overflow-hidden'
                }`}
            >
                <div className='bg-[var(--color-sidecar-white)] border-t border-[var(--color-gold-200)] shadow-lg'>
                    <div className='pt-2 pb-3 space-y-1'>
                        {navItems.map((item) => {
                            const isActive =
                                pathname === item.path ||
                                (item.path !== '/' &&
                                    pathname?.startsWith(item.path));

                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`block pl-4 pr-4 py-3 border-l-4 text-base font-medium transition-colors duration-200 ${
                                        isActive
                                            ? 'bg-[var(--color-gold-50)] border-[var(--color-sidecar-gold)] text-[var(--color-sidecar-gold)]'
                                            : 'border-transparent text-[var(--color-sidecar-gray)] hover:bg-[var(--color-gold-50)] hover:border-[var(--color-gold-300)] hover:text-[var(--color-sidecar-gold)]'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Auth */}
                    <div className='pt-4 pb-3 border-t border-[var(--color-gold-200)]'>
                        {isLoaded && (
                            <div className='px-4'>
                                {isSignedIn ? (
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <div className='text-sm font-medium text-[var(--color-sidecar-gray)] mb-2'>
                                                Your Account
                                            </div>
                                        </div>
                                        <UserButton
                                            afterSignOutUrl='/'
                                            appearance={{
                                                elements: {
                                                    avatarBox:
                                                        'w-10 h-10 border-2 border-[var(--color-gold-300)]',
                                                },
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <SignInButton mode='modal'>
                                        <button className='w-full bg-[var(--color-sidecar-gold)] text-[var(--color-sidecar-cream)] px-6 py-3 rounded-full font-medium hover:bg-[var(--color-gold-600)] transition-colors duration-200 shadow-sm hover:shadow-md'>
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
