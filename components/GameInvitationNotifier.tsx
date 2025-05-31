/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { client } from '@/sanity/lib/client';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';

export default function GameInvitationNotifier() {
    const [invitations, setInvitations] = useState<any[]>([]);
    const [responding, setResponding] = useState<string | null>(null);
    const router = useRouter();
    const { user } = useUser();

    // Listen for invitations using Sanity subscription
    useEffect(() => {
        if (!user || !user.id) return;

        async function setupInvitationListener() {
            try {
                // Get current user's Sanity ID
                if (!user || !user.id) return;
                const currentUserId = await client.fetch(
                    `*[_type == "member" && clerkId == $clerkId][0]._id`,
                    { clerkId: user.id },
                );

                if (!currentUserId) return;

                // Subscribe to pending invitations
                const subscription = client
                    .listen(
                        `*[_type == "gameInvitation" && to._ref == $userId && status == "pending"]`,
                        { userId: currentUserId },
                    )
                    .subscribe({
                        next: (update) => {
                            if (update.result) {
                                // Fetch full invitation details with expanded references
                                fetchInvitations(currentUserId);
                            }
                        },
                        error: (err) => {
                            console.error(
                                'Error subscribing to invitations:',
                                err,
                            );
                        },
                    });

                // Initial fetch
                fetchInvitations(currentUserId);

                return () => subscription.unsubscribe();
            } catch (error) {
                console.error('Error setting up invitation listener:', error);
            }
        }

        setupInvitationListener();
    }, [user, user?.id]);

    async function fetchInvitations(userId: string) {
        try {
            const pendingInvitations = await client.fetch(
                `
        *[_type == "gameInvitation" && to._ref == $userId && status == "pending"]{
          _id,
          createdAt,
          from->{_id, name, image, profession}
        } | order(createdAt desc)
      `,
                { userId },
            );

            setInvitations(pendingInvitations || []);
        } catch (error) {
            console.error('Error fetching invitations:', error);
        }
    }
    // components/GameInvitationNotifier.tsx - Update the handleResponse function
    async function handleResponse(invitationId: string, accept: boolean) {
        try {
            setResponding(invitationId);

            // Call our API route instead of directly updating Sanity
            const response = await fetch('/api/games/respond-to-invitation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invitationId, accept }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || 'Failed to respond to invitation',
                );
            }

            // Remove from the local list
            setInvitations(
                invitations.filter((inv) => inv._id !== invitationId),
            );

            // If accepted, redirect to character selection
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
    return (
        <div className='fixed bottom-4 right-4 z-50'>
            {invitations.map((invitation) => (
                <div
                    key={invitation._id}
                    className='bg-white rounded-lg shadow-lg p-4 mb-3 w-80 border-l-4 border-blue-500 animate-fadeIn'
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
                                        {invitation.from?.name?.charAt(0) ||
                                            '?'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div>
                            <p className='font-medium text-gray-900'>
                                {invitation.from?.name}
                            </p>
                            <p className='text-xs text-gray-500'>
                                {invitation.from?.profession}
                            </p>
                            <p className='text-sm text-blue-600 mt-1'>
                                Invites you to play Guess Who
                            </p>
                        </div>
                    </div>

                    <div className='flex justify-between mt-2'>
                        <button
                            onClick={() =>
                                handleResponse(invitation._id, false)
                            }
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
                            Accept & Play
                        </button>
                    </div>

                    {/* Invitation time indicator */}
                    <div className='mt-3 text-right'>
                        <span className='text-xs text-gray-400'>
                            {new Date(invitation.createdAt).toLocaleTimeString(
                                [],
                                {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                },
                            )}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
