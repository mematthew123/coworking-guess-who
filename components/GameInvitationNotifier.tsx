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
                    <div className={`text-xs px-2 py-1 rounded ${
                        connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                        connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                        RT: {connectionStatus}
                    </div>
                </div>
            )}

            <div className='fixed bottom-4 right-4 z-50 space-y-3'>
                {invitations.map((invitation) => (
                    <div
                        key={invitation._id}
                        className='bg-white rounded-lg shadow-xl p-4 w-80 border-l-4 border-blue-500 animate-slide-in'
                    >
                        <div className='flex items-center mb-3'>
                            <div className='w-12 h-12 rounded-full bg-blue-100 flex-shrink-0 mr-3 overflow-hidden'>
                                {invitation.from?.image ? (
                                    <Image
                                        src={urlFor(invitation.from.image)
                                            .width(48)
                                            .height(48)
                                            .url()}
                                        alt={invitation.from.name || 'Player'}
                                        width={48}
                                        height={48}
                                        className='w-full h-full object-cover'
                                    />
                                ) : (
                                    <div className='w-full h-full flex items-center justify-center'>
                                        <span className='text-lg font-bold text-blue-500'>
                                            {invitation.from?.name?.charAt(0) || '?'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className='flex-1'>
                                <p className='font-medium text-gray-900'>
                                    {invitation.from?.name}
                                </p>
                                <p className='text-xs text-gray-500'>
                                    {invitation.from?.profession}
                                </p>
                                <p className='text-sm text-blue-600 mt-1'>
                                    Invites you to play Guess Who!
                                </p>
                            </div>
                        </div>

                        <div className='flex justify-between'>
                            <button
                                onClick={() => handleResponse(invitation._id, false)}
                                disabled={responding === invitation._id}
                                className={`px-4 py-2 rounded text-sm transition-colors ${
                                    responding === invitation._id
                                        ? 'bg-gray-200 text-gray-500 cursor-wait'
                                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                Decline
                            </button>
                            <button
                                onClick={() => handleResponse(invitation._id, true)}
                                disabled={responding === invitation._id}
                                className={`px-4 py-2 rounded text-sm ${
                                    responding === invitation._id
                                        ? 'bg-blue-300 text-white cursor-wait'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {responding === invitation._id ? 'Loading...' : 'Accept & Play'}
                            </button>
                        </div>

                        <div className='mt-3 text-right'>
                            <span className='text-xs text-gray-400'>
                                {invitation.createdAt ? new Date(invitation.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }) : 'Just now'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}