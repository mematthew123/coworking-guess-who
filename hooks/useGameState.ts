// hooks/useGameState.ts
import { useState, useEffect, useCallback } from 'react';
import { client } from '@/sanity/lib/client';
import {
    ExpandedGame,
    ExpandedMember,
    ExpandedQuestionCategory,
} from '@/types/groqResults';
import { useUser } from '@clerk/nextjs';
import { 
    resolveQuestionAnswer, 
    calculateEliminatedFromHistory 
} from '@/lib/question-utils';

export default function useGameState(gameId: string) {
    const [game, setGame] = useState<ExpandedGame | null>(null);
    const [boardMembers, setBoardMembers] = useState<ExpandedMember[]>([]);
    const [eliminatedIds, setEliminatedIds] = useState<string[]>([]);
    const [questionCategories, setQuestionCategories] = useState<
        ExpandedQuestionCategory[]
    >([]);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();

    const fetchGameData = useCallback(async () => {
        try {
            setLoading(true);

            // Get the Sanity member ID for the current user
            let sanityUserId = null;
            if (user?.id) {
                const memberDoc = await client.fetch(
                    `*[_type == "member" && clerkId == $clerkId][0]._id`,
                    { clerkId: user.id },
                );
                sanityUserId = memberDoc;
            }

            // Fetch game data
            const gameData = await client.fetch<ExpandedGame>(
                `
                *[_type == "game" && _id == $gameId][0]{
                  ...,
                  playerOne->{_id, name},
                  playerTwo->{_id, name},
                  playerOneTarget->{_id},
                  playerTwoTarget->{_id},
                  boardMembers[]->{
                    _id, 
                    name, 
                    profession, 
                    image,
                    professionalAttributes,
                    technicalSkills,
                    personalTraits,
                    workStyle,
                    hobbies,
                    experience
                  }
                }
                `,
                { gameId },
            );

            if (!gameData) {
                setError('Game not found');
                setLoading(false);
                return;
            }

            setGame(gameData);
            setBoardMembers(gameData.boardMembers || []);

            // Check if it's our turn
            setIsMyTurn(sanityUserId === gameData.currentTurn);

            // Fetch question categories
            const categories = await client.fetch<ExpandedQuestionCategory[]>(`
                *[_type == "questionCategory"]{
                    _id, 
                    title, 
                    icon, 
                    description,
                    questions[]
                }
            `);

            setQuestionCategories(categories);

            // Calculate eliminated members based on game history
            if (gameData.moves && gameData.moves.length > 0 && sanityUserId) {
                const eliminated = calculateEliminatedFromHistory(
                    gameData.moves,
                    gameData.boardMembers,
                    categories,
                    sanityUserId
                );
                setEliminatedIds(eliminated);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching game data:', err);
            setError('Failed to load game data');
            setLoading(false);
        }
    }, [user?.id, gameId]);

    useEffect(() => {
        fetchGameData();
    }, [fetchGameData]);

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
                console.error('Error asking question:', errorData);
                return;
            }

            const data = await response.json();

            // Update local state
            setIsMyTurn(false);

            // Calculate newly eliminated members
            if (data.move && data.move.answer !== undefined) {
                const category = questionCategories.find(c => c._id === categoryId);
                const question = category?.questions?.[questionIndex];

                if (question) {
                    // Get currently remaining members
                    const remainingMembers = boardMembers.filter(
                        m => !eliminatedIds.includes(m._id)
                    );

                    // Find members to eliminate based on the answer
                    const newEliminatedIds = remainingMembers
                        .filter(member => {
                            const memberAnswer = resolveQuestionAnswer(question, member);
                            return memberAnswer !== data.move.answer;
                        })
                        .map(m => m._id);

                    // Update eliminated list
                    setEliminatedIds([...eliminatedIds, ...newEliminatedIds]);
                }
            }

            // Refresh game data after a short delay
            setTimeout(() => {
                fetchGameData();
            }, 1000);

        } catch (err) {
            console.error('Error asking question:', err);
        }
    };

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
                console.error('Error making guess:', errorData);
                return false;
            }

            const data = await response.json();

            // Update local state
            if (data.gameOver) {
                setGame((prev) =>
                    prev
                        ? { ...prev, status: 'completed', winner: data.winner }
                        : null,
                );
            } else {
                setIsMyTurn(false);
            }

            // Refresh game data
            setTimeout(() => {
                fetchGameData();
            }, 1000);

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