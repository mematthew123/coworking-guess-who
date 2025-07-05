/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { browserClient } from '@/sanity/lib/client';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';

export default function GameInvitationNotifier() {
    const [invitations, setInvitations] = useState<any[]>([]);
    const [responding, setResponding] = useState<string | null>(null);
    const [sanityUserId, setSanityUserId] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const subscriptionRef = useRef<any>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Get Sanity user ID
    useEffect(() => {
        if (!isLoaded || !user?.id) return;

        async function fetchSanityUserId() {
            try {
                const response = await fetch('/api/profile');
                if (response.ok) {
                    const profile = await response.json();
                    setSanityUserId(profile._id);
                }
            } catch (error) {
                console.error('Error fetching Sanity user ID:', error);
            }
        }

        fetchSanityUserId();
    }, [isLoaded, user?.id]);

    // Optimized invitation fetching
    const fetchInvitations = useCallback(async () => {
        if (!sanityUserId) return;

        try {
            const pendingInvitations = await browserClient.fetch(
                `*[_type == "gameInvitation" && to._ref == $userId && status == "pending"]{
                    _id,
                    _createdAt,
                    createdAt,
                    from->{_id, name, image, profession}
                } | order(_createdAt desc)`,
                { userId: sanityUserId }
            );

            console.log('[RT] Fetched invitations:', pendingInvitations?.length || 0);
            
            // Check for new invitations
            if (pendingInvitations.length > invitations.length) {
                playNotificationSound();
            }
            
            setInvitations(pendingInvitations || []);
        } catch (error) {
            console.error('Error fetching invitations:', error);
        }
    }, [sanityUserId, invitations.length]);

    // Set up real-time subscription
    useEffect(() => {
        if (!sanityUserId) return;

        let isSubscribed = true;

        async function setupSubscription() {
            try {
                console.log('[RT] Setting up real-time subscription for:', sanityUserId);
                setConnectionStatus('connecting');

                // Initial fetch
                await fetchInvitations();

                // Create subscription with optimized parameters
                const query = `*[_type == "gameInvitation" && to._ref == $userId && status == "pending"]`;
                const params = { userId: sanityUserId };

                subscriptionRef.current = browserClient
                    .listen(
                        query, 
                        params,
                        {
                            includeResult: true,
                            includePreviousRevision: false,
                            visibility: 'query',
                            events: ['welcome', 'mutation', 'reconnect'],
                        }
                    )
                    .subscribe({
                        next: (update: { type: string; }) => {
                            console.log('[RT] Update received:', update.type, new Date().toISOString());
                            
                            if (update.type === 'welcome') {
                                setConnectionStatus('connected');
                                console.log('[RT] WebSocket connected successfully');
                            }
                            
                            if (update.type === 'mutation' || update.type === 'reconnect') {
                                // Immediately fetch new data
                                if (isSubscribed) {
                                    fetchInvitations();
                                }
                            }
                        },
                        error: (err: any) => {
                            console.error('[RT] Subscription error:', err);
                            setConnectionStatus('error');
                            
                            // Attempt to reconnect after error
                            if (isSubscribed && !reconnectTimeoutRef.current) {
                                reconnectTimeoutRef.current = setTimeout(() => {
                                    console.log('[RT] Attempting to reconnect...');
                                    reconnectTimeoutRef.current = null;
                                    if (subscriptionRef.current) {
                                        subscriptionRef.current.unsubscribe();
                                    }
                                    setupSubscription();
                                }, 5000);
                            }
                        },
                    });

            } catch (error) {
                console.error('[RT] Failed to setup subscription:', error);
                setConnectionStatus('error');
            }
        }

        setupSubscription();

        return () => {
            isSubscribed = false;
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [fetchInvitations, sanityUserId]);

    function playNotificationSound() {
        try {
            const audio = new Audio('/sounds/notification.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Audio play error:', e));
        } catch (e) {
            console.log('Audio error:', e);
        }
    }

    async function handleResponse(invitationId: string, accept: boolean) {
        try {
            setResponding(invitationId);

            const response = await fetch('/api/games/respond-to-invitation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invitationId, accept }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to respond to invitation');
            }

            // Remove from local list immediately
            setInvitations(prev => prev.filter(inv => inv._id !== invitationId));

            if (accept) {
                router.push(`/games/setup/${invitationId}`);
            }
        } catch (error) {
            console.error('Error responding to invitation:', error);
            alert('There was a problem responding to the invitation');
        } finally {
            setResponding(null);
        }
    }

    // Don't render if no invitations
    if (invitations.length === 0) return null;

return (
        <>
            {/* Connection status indicator (debug) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="fixed top-4 right-4 z-50">
                    <div className={`text-xs px-2 py-1 font-mono font-bold uppercase ${
                        connectionStatus === 'connected' ? 'bg-green text-black border-2 border-black' :
                        connectionStatus === 'connecting' ? 'bg-yellow text-black border-2 border-black' :
                        'bg-red text-white border-2 border-black'
                    }`}>
                        RT: {connectionStatus}
                    </div>
                </div>
            )}

            <div className='fixed bottom-4 right-4 z-50 space-y-4'>
                {invitations.map((invitation, index) => (
                    <div
                        key={invitation._id}
                        className={`bg-white border-6 border-black p-6 w-80 shadow-brutal-xl animate-slide-in transform ${
                            index % 2 === 0 ? 'rotate-1' : '-rotate-1'
                        }`}
                        style={{
                            animation: 'slideInBrutalist 0.3s ease-out forwards',
                            animationDelay: `${index * 0.1}s`
                        }}
                    >
                        {/* Header Banner */}
                        <div className='bg-pink text-white p-3 -m-6 mb-4 border-b-6 border-black'>
                            <h3 className='font-black text-xl uppercase text-center'>
                                🎮 GAME INVITE!
                            </h3>
                        </div>

                        <div className='flex items-center mb-4'>
                            <div className='w-16 h-16 bg-yellow border-4 border-black flex-shrink-0 mr-4 overflow-hidden'>
                                {invitation.from?.image ? (
                                    <Image
                                        src={urlFor(invitation.from.image)
                                            .width(64)
                                            .height(64)
                                            .url()}
                                        alt={invitation.from.name || 'Player'}
                                        width={64}
                                        height={64}
                                        className='w-full h-full object-cover'
                                    />
                                ) : (
                                    <div className='w-full h-full flex items-center justify-center'>
                                        <span className='text-2xl font-black text-black'>
                                            {invitation.from?.name?.charAt(0) || '?'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className='flex-1'>
                                <p className='font-black text-xl uppercase text-black'>
                                    {invitation.from?.name}
                                </p>
                                <p className='text-sm font-bold uppercase text-black bg-orange px-2 py-1 inline-block border-2 border-black mt-1'>
                                    {invitation.from?.profession}
                                </p>
                            </div>
                        </div>

                        <div className='bg-blue text-white p-3 mb-4 border-4 border-black shadow-brutal-sm'>
                            <p className='font-black text-center uppercase'>
                                WANTS TO PLAY GUESS WHO!
                            </p>
                        </div>

                        <div className='flex gap-3'>
                            <button
                                onClick={() => handleResponse(invitation._id, false)}
                                disabled={responding === invitation._id}
                                className={`flex-1 py-3 px-4 font-black uppercase transition-all duration-100 ${
                                    responding === invitation._id
                                        ? 'bg-gray-300 text-gray-500 border-4 border-gray-500 cursor-wait'
                                        : 'bg-white text-black border-4 border-black shadow-brutal-sm hover:shadow-brutal-md hover:translate-x-[-2px] hover:translate-y-[-2px]'
                                }`}
                            >
                                NAH
                            </button>
                            <button
                                onClick={() => handleResponse(invitation._id, true)}
                                disabled={responding === invitation._id}
                                className={`flex-1 py-3 px-4 font-black uppercase transition-all duration-100 ${
                                    responding === invitation._id
                                        ? 'bg-green text-black border-4 border-black cursor-wait animate-pulse'
                                        : 'bg-green text-black border-4 border-black shadow-brutal-md hover:shadow-brutal-lg hover:translate-x-[-4px] hover:translate-y-[-4px]'
                                }`}
                            >
                                {responding === invitation._id ? 'LOADING...' : "LET'S GO!"}
                            </button>
                        </div>

                        <div className='mt-4 text-center'>
                            <span className='text-xs font-mono font-bold uppercase bg-yellow px-2 py-1 border-2 border-black inline-block'>
                                {invitation.createdAt ? new Date(invitation.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }) : 'JUST NOW'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes slideInBrutalist {
                    from {
                        transform: translateX(400px) rotate(10deg);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0) rotate(var(--rotation, 0deg));
                        opacity: 1;
                    }
                }
            `}</style>
        </>
    );
}