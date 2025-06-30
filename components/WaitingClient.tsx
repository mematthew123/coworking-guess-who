'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import Image from 'next/image';

export default function WaitingClient({
    invitationId,
}: {
    invitationId: string;
}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [invitation, setInvitation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Setup subscription to listen for invitation changes
        const subscription = client
            .listen(`*[_type == "gameInvitation" && _id == $invitationId][0]`, {
                invitationId,
            })
            .subscribe({
                next: (update) => {
                    if (update.result) {
                        setInvitation(update.result);

                        // If invitation is accepted, redirect to character selection
                        if (update.result.status === 'accepted') {
                            router.push(`/games/setup/${invitationId}`);
                        } else if (update.result.status === 'declined') {
                            // If declined, go back to find opponent
                            setError('Invitation was declined');
                            // After a delay, go back to find opponent
                            setTimeout(() => {
                                router.push('/games/new');
                            }, 3000);
                        }
                    }
                    setLoading(false);
                },
                error: (err) => {
                    console.error('Error listening for updates:', err);
                    setError('Error monitoring invitation status');
                    setLoading(false);
                },
            });

        // Initial fetch
        const fetchInvitation = async () => {
            try {
                const invitationData = await client.fetch(
                    `
          *[_type == "gameInvitation" && _id == $invitationId][0]{
            _id,
            status,
            createdAt,
            from->{_id, name, image},
            to->{_id, name, image}
          }
        `,
                    { invitationId },
                );

                setInvitation(invitationData);
                setLoading(false);

                // Check if already accepted/declined
                if (invitationData?.status === 'accepted') {
                    router.push(`/games/setup/${invitationId}`);
                } else if (invitationData?.status === 'declined') {
                    setError('Invitation was declined');
                    setTimeout(() => {
                        router.push('/games/new');
                    }, 3000);
                }
            } catch (err) {
                console.error('Error fetching invitation:', err);
                setError('Failed to load invitation details');
                setLoading(false);
            }
        };

        fetchInvitation();

        // Cleanup subscription
        return () => subscription.unsubscribe();
    }, [invitationId, router]);

    // Loading state
    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-[50vh] bg-cream'>
                <div className='bg-pink border-8 border-black p-8 shadow-brutal-xl animate-pulse'>
                    <div className='text-6xl font-black uppercase'>
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className='bg-red border-8 border-black p-6 shadow-brutal-xl'>
                <p className='text-white font-black uppercase text-xl mb-4'>
                    {error}
                </p>
                <button
                    onClick={() => router.push('/games/new')}
                    className='bg-black text-red font-black uppercase px-6 py-3 border-4 border-red shadow-brutal-md hover:shadow-brutal-lg hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-100'
                >
                    Find Another Opponent
                </button>
            </div>
        );
    }

    if (!invitation) {
        return (
            <div className='bg-yellow border-8 border-black p-6 shadow-brutal-xl'>
                <p className='text-black font-black uppercase text-xl mb-4'>
                    Invitation not found
                </p>
                <button
                    onClick={() => router.push('/games/new')}
                    className='bg-black text-yellow font-black uppercase px-6 py-3 border-4 border-yellow shadow-brutal-md hover:shadow-brutal-lg hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-100'
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-cream relative overflow-hidden flex items-center justify-center'>
            {/* Geometric Background */}
            <div className='absolute inset-0 overflow-hidden pointer-events-none'>
                <div className='absolute top-20 right-10 w-48 h-48 bg-yellow border-8 border-black rotate-12' />
                <div className='absolute bottom-20 left-20 w-64 h-32 bg-pink border-8 border-black -rotate-6' />
                <div className='absolute top-1/2 left-1/3 w-32 h-64 bg-green border-8 border-black rotate-45' />
            </div>

            <div className='relative z-10 bg-white border-8 border-black p-12 shadow-brutal-xl text-center max-w-2xl'>
                <h2 className='text-4xl font-black uppercase mb-8'>
                    <span className='inline-block bg-blue text-white px-4 py-2 shadow-brutal-md transform -rotate-2'>
                        Waiting for Response
                    </span>
                </h2>

                <div className='flex items-center justify-center mb-8'>
                    <div className='w-20 h-20 border-6 border-black overflow-hidden shadow-brutal-md'>
                        {invitation.from?.image ? (
                            <Image
                                width={80}
                                height={80}
                                src={urlFor(invitation.from.image)
                                    .width(80)
                                    .height(80)
                                    .url()}
                                alt={invitation.from.name}
                                className='w-full h-full object-cover'
                            />
                        ) : (
                            <div className='w-full h-full bg-blue flex items-center justify-center'>
                                <span className='text-3xl text-white font-black'>
                                    {invitation.from?.name?.charAt(0) || '?'}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className='mx-8'>
                        <div className='bg-black px-6 py-2 animate-pulse'>
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='40'
                                height='40'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='#ffee00'
                                strokeWidth='4'
                                strokeLinecap='square'
                                strokeLinejoin='miter'
                            >
                                <line x1='5' y1='12' x2='19' y2='12'></line>
                                <polyline points='12 5 19 12 12 19'></polyline>
                            </svg>
                        </div>
                    </div>

                    <div className='w-20 h-20 border-6 border-black overflow-hidden shadow-brutal-md'>
                        {invitation.to?.image ? (
                            <Image
                                width={80}
                                height={80}
                                src={urlFor(invitation.to.image)
                                    .width(80)
                                    .height(80)
                                    .url()}
                                alt={invitation.to.name}
                                className='w-full h-full object-cover'
                            />
                        ) : (
                            <div className='w-full h-full bg-purple flex items-center justify-center'>
                                <span className='text-3xl text-white font-black'>
                                    {invitation.to?.name?.charAt(0) || '?'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <p className='text-xl font-bold uppercase mb-8'>
                    Waiting for{' '}
                    <span className='bg-yellow px-2 py-1'>
                        {invitation.to?.name}
                    </span>{' '}
                    to respond
                </p>

                <div className='flex justify-center gap-6'>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className='bg-white text-black font-black uppercase px-6 py-3 border-6 border-black shadow-brutal-md hover:shadow-brutal-lg hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-100'
                    >
                        Back to Dashboard
                    </button>

                    <button
                        onClick={() => router.push('/games/new')}
                        className='bg-pink text-white font-black uppercase px-6 py-3 border-6 border-black shadow-brutal-md hover:shadow-brutal-lg hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-100'
                    >
                        Find Another Opponent
                    </button>
                </div>
            </div>
        </div>
    );
}
