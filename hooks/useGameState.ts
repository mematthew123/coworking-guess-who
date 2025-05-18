import { useState, useEffect } from 'react';
import { Question, GameMove } from '@/sanity.types';
import { client } from '@/sanity/lib/client';
import {
    ExpandedGame,
    ExpandedMember,
    ExpandedQuestionCategory,
    getNestedProperty,
} from '@/types/groqResults';
import { useUser } from '@clerk/nextjs';
import { useCallback } from 'react';

function resolveQuestionAnswer(
    question: Question,
    member: ExpandedMember,
): boolean {
    const { attributePath, attributeValue } = question;

    if (!attributePath) return false;

    // Get the property value using the helper
    const value = getNestedProperty(member, attributePath);

    // Different attribute types require different comparisons
    if (Array.isArray(value)) {
        return attributeValue ? value.includes(attributeValue) : false;
    } else if (typeof value === 'boolean') {
        return value === true;
    } else if (typeof value === 'string') {
        return attributeValue ? value === attributeValue : false;
    }

    return false;
}

function parseQuestionId(questionId: string): {
    categoryId: string;
    questionIndex: number;
} {
    const [categoryId, indexStr] = questionId.split(':');
    return {
        categoryId,
        questionIndex: parseInt(indexStr, 10),
    };
}

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
    const playerId = user?.id;

    // Move fetchGameData to component scope so it can be returned

    const fetchGameData = useCallback(async () => {
        try {
            setLoading(true);

            // First, get the Sanity member ID for the current user
            let sanityUserId = null;
            if (user?.id) {
                const memberDoc = await client.fetch(
                    `*[_type == "member" && clerkId == $clerkId][0]._id`,
                    { clerkId: user.id },
                );
                sanityUserId = memberDoc;
            }

            // Now fetch game data
            const gameData = await client.fetch<ExpandedGame>(
                `
        *[_type == "game" && _id == $gameId][0]{
          ...,
          playerOne->{_id, name},
          playerTwo->{_id, name},
          playerOneTarget->{_id},
          playerTwoTarget->{_id},
          boardMembers[]->{
            _id, name, profession, image, skills, interests, workspacePreferences
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

            // Check if it's our turn using the Sanity member ID
            const isYourTurn = sanityUserId === gameData.currentTurn;
            console.log(
                'Is your turn:',
                isYourTurn,
                'sanityUserId:',
                sanityUserId,
                'currentTurn:',
                gameData.currentTurn,
            );
            setIsMyTurn(isYourTurn);

            // Fetch question categories
            const categories = await client.fetch<ExpandedQuestionCategory[]>(`
          *[_type == "questionCategory"]{
            _id, title, icon, description,
            questions[]
          }
        `);

            setQuestionCategories(categories);

            // Calculate eliminated members based on previous moves
            if (gameData.moves && gameData.moves.length > 0) {
                const eliminated = calculateEliminatedMembers(
                    gameData.moves,
                    gameData.boardMembers,
                    categories,
                    playerId ?? '',
                );
                setEliminatedIds(eliminated);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching game data:', err);
            setError('Failed to load game data');
            setLoading(false);
        }
    }, [user?.id, gameId, playerId]);

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

            // Update local state to reflect the turn change
            setIsMyTurn(false);

            // Update local state with the new eliminated members
            if (data.move && data.move.answer !== undefined) {
                const category = questionCategories.find(
                    (c) => c._id === categoryId,
                );
                if (!category || !category.questions) return;

                const question = category.questions[questionIndex];

                // Calculate eliminated members
                const newEliminatedIds = [...eliminatedIds];
                boardMembers.forEach((member) => {
                    if (!eliminatedIds.includes(member._id)) {
                        const memberWouldAnswer = resolveQuestionAnswer(
                            question,
                            member,
                        );
                        if (memberWouldAnswer !== data.move.answer) {
                            newEliminatedIds.push(member._id);
                        }
                    }
                });

                setEliminatedIds(newEliminatedIds);
            }
        } catch (err) {
            console.error('Error asking question:', err);
        }
    };

    // Helper function to calculate eliminated members
    const calculateEliminatedMembers = (
        moves: Array<GameMove & { _key: string }>,
        members: ExpandedMember[],
        categories: ExpandedQuestionCategory[],
        currentPlayerId: string,
    ): string[] => {
        if (!moves || !Array.isArray(moves)) return [];

        const eliminated: string[] = [];

        // Filter moves to only include the current player's moves
        const playerMoves = moves.filter(
            (move) => move.playerId === currentPlayerId,
        );

        // For each member, check if they would have been eliminated by any move
        members.forEach((member) => {
            for (const move of playerMoves) {
                if (!move.questionId) continue;

                const { categoryId, questionIndex } = parseQuestionId(
                    move.questionId,
                );
                const category = categories.find((c) => c._id === categoryId);
                if (!category || !category.questions) continue;

                const question = category.questions[questionIndex];
                if (!question) continue;

                const memberWouldAnswer = resolveQuestionAnswer(
                    question,
                    member,
                );
                if (memberWouldAnswer !== move.answer) {
                    eliminated.push(member._id);
                    break;
                }
            }
        });

        return eliminated;
    };

    // Modified makeGuess function in useGameState.ts
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
                        ? { ...prev, status: 'completed', winner: user?.id }
                        : null,
                );
            } else {
                setIsMyTurn(false);
            }

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
