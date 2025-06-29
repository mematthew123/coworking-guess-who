import Link from 'next/link';
import React from 'react';

export default function Footer() {
    return (
        <div>
            {/* Footer */}
            <footer className='bg-black relative overflow-hidden'>
                {/* Geometric decoration */}
                <div className='absolute top-0 left-0 right-0 h-4 bg-yellow'></div>
                <div className='absolute top-4 left-0 right-0 h-4 bg-pink'></div>

                <div className='relative z-10 py-16'>
                    <div className='container mx-auto px-4'>
                        <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-12'>
                            <div>
                                <h3 className='text-3xl font-black uppercase bg-yellow text-black px-4 py-2 inline-block shadow-brutal-md mb-4'>
                                    Guess Who
                                </h3>
                                <p className='text-yellow font-bold uppercase'>
                                    Building stronger coworking communities
                                    through fun and games.
                                </p>
                            </div>

                            <div>
                                <h4 className='font-black uppercase text-yellow text-xl mb-4 bg-black border-4 border-yellow px-3 py-1 inline-block'>
                                    Quick Links
                                </h4>
                                <ul className='space-y-3'>
                                    <li>
                                        <Link
                                            href='/games'
                                            className='text-white font-bold uppercase hover:text-yellow hover:translate-x-2 inline-block transition-all duration-100'
                                        >
                                            → Play Now
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href='/profile'
                                            className='text-white font-bold uppercase hover:text-yellow hover:translate-x-2 inline-block transition-all duration-100'
                                        >
                                            → My Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href='/dashboard'
                                            className='text-white font-bold uppercase hover:text-yellow hover:translate-x-2 inline-block transition-all duration-100'
                                        >
                                            → Dashboard
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className='font-black uppercase text-yellow text-xl mb-4 bg-black border-4 border-pink px-3 py-1 inline-block'>
                                    Community
                                </h4>
                                <ul className='space-y-3'>
                                    <li>
                                        <a
                                            href='#'
                                            className='text-white font-bold uppercase hover:text-pink hover:translate-x-2 inline-block transition-all duration-100'
                                        >
                                            → About Us
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href='#'
                                            className='text-white font-bold uppercase hover:text-pink hover:translate-x-2 inline-block transition-all duration-100'
                                        >
                                            → Blog
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href='#'
                                            className='text-white font-bold uppercase hover:text-pink hover:translate-x-2 inline-block transition-all duration-100'
                                        >
                                            → Support
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href='#'
                                            className='text-white font-bold uppercase hover:text-pink hover:translate-x-2 inline-block transition-all duration-100'
                                        >
                                            → Memberships
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className='font-black uppercase text-yellow text-xl mb-4 bg-black border-4 border-green px-3 py-1 inline-block'>
                                    Connect
                                </h4>
                                <p className='text-white font-bold uppercase mb-4'>
                                    Have questions? We&apos;d love to hear from
                                    you!
                                </p>
                                <a
                                    href='mailto:hello@coworkingguesswho.com'
                                    className='bg-green text-black font-black uppercase px-4 py-2 inline-block shadow-brutal-sm hover:shadow-brutal-md hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-100'
                                >
                                    Email Us
                                </a>
                            </div>
                        </div>

                        <div className='border-t-8 border-yellow pt-8'>
                            <div className='text-center'>
                                <p className='text-yellow font-black uppercase text-lg'>
                                    © 2025 Coworking Guess Who. All rights
                                    reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
