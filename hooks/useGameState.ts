/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from 'react';
import { client } from '@/sanity/lib/client';
import { useUser } from '@clerk/nextjs';
import { ExpandedGame } from '@/types/groqResults';
import { QuestionCategory } from '@/sanity.types';

export default function useGameState(gameId: string) {
    const { user } = useUser();
    const [game, setGame] = useState<ExpandedGame | null>(null);
    const [boardMembers, setBoardMembers] = useState<ExpandedGame['boardMembers']>([]);
    const [eliminatedIds, setEliminatedIds] = useState<string[]>([]);
    const [questionCategories, setQuestionCategories] = useState<QuestionCategory[]>([]);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const subscriptionRef = useRef<any>(null);

    // Fetch game data function
    const fetchGameData = useCallback(async () => {
        if (!gameId) return;

        try {
            const gameData = await client.fetch(
                `*[_type == "game" && _id == $gameId][0]{
                    ...,
                    playerOne->{_id, name, clerkId},
                    playerTwo->{_id, name, clerkId},
                    playerOneTarget->{...},
                    playerTwoTarget->{...},
                    boardMembers[]->{...},
                    moves[]{
                        ...,
                        categoryId,
                        questionIndex
                    }
                }`,
                { gameId }
            );

            if (!gameData) {
                setError('Game not found');
                setLoading(false);
                return;
            }

            setGame(gameData);
            setBoardMembers(gameData.boardMembers || []);
            
            // Update turn status
            if (user?.id) {
                const currentUserId = 
                    gameData.playerOne.clerkId === user.id ? gameData.playerOne._id :
                    gameData.playerTwo.clerkId === user.id ? gameData.playerTwo._id : null;
                
                setIsMyTurn(gameData.currentTurn === currentUserId);
            }

            // Process eliminated members from moves
            const eliminated = new Set<string>();
            for (const move of gameData.moves || []) {
                if (move.action === 'elimination' && move.eliminatedMembers) {
                    move.eliminatedMembers.forEach((id: string) => eliminated.add(id));
                }
            }
            setEliminatedIds(Array.from(eliminated));

            // Fetch question categories
            const categories = await client.fetch(
                `*[_type == "questionCategory"]{
                    _id,
                    title,
                    questions
                }`
            );
            setQuestionCategories(categories);

            setLoading(false);
            setError(null);
        } catch (err) {
            console.error('Error fetching game data:', err);
            setError('Failed to load game');
            setLoading(false);
        }
    }, [gameId, user?.id]);

    // Set up real-time subscription
    useEffect(() => {
        if (!gameId) return;

        // Initial fetch
        fetchGameData();

        // Set up real-time listener
        const query = `*[_type == "game" && _id == $gameId]`;
        const params = { gameId };

        subscriptionRef.current = client.listen(query, params).subscribe({
            next: (update) => {
                console.log('Real-time update received:', update);
                
                // Fetch fresh data on any change
                if (update.type === 'mutation') {
                    fetchGameData();
                }
            },
            error: (err) => {
                console.error('Real-time subscription error:', err);
                setError('Real-time connection lost');
            }
        });

        // Cleanup subscription
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
            }
        };
    }, [gameId, fetchGameData]);

    // Ask question function
    const askQuestion = async (categoryId: string, questionIndex: number) => {
        if (!game || !isMyTurn) {
            console.log('Not your turn');
            return;
        }

        try {
            const response = await fetch('/api/games/ask-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId,
                    categoryId,
                    questionIndex,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to ask question');
            }

            // The real-time subscription will automatically update the UI
            // No need to manually fetch or reload
        } catch (err) {
            console.error('Error asking question:', err);
            throw err;
        }
    };

    // Make guess function
    const makeGuess = async (memberId: string) => {
        if (!game || !isMyTurn) {
            console.log('Not your turn');
            return false;
        }

        try {
            const response = await fetch('/api/games/make-guess', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId,
                    memberId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to make guess');
            }

            const data = await response.json();
            // The real-time subscription will handle the update
            return data.correct;
        } catch (err) {
            console.error('Error making guess:', err);
            return false;
        }
    };

    return {
        game,
        setGame,
        boardMembers,
        eliminatedIds,
        setEliminatedIds,
        questionCategories,
        isMyTurn,
        loading,
        error,
        askQuestion,
        makeGuess,
        fetchGameData,
    };
}