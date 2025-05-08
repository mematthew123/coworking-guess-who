import { useState, useEffect } from 'react';
import { Question, GameMove } from '@/sanity.types';
import { client } from '@/sanity/lib/client';
import { 
  ExpandedGame, 
  ExpandedMember, 
  ExpandedQuestionCategory,
  getNestedProperty 
} from '@/types/groqResults';

function resolveQuestionAnswer(question: Question, member: ExpandedMember): boolean {
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

function generateQuestionId(categoryId: string, questionIndex: number): string {
  return `${categoryId}:${questionIndex}`;
}

function parseQuestionId(questionId: string): { categoryId: string; questionIndex: number } {
  const [categoryId, indexStr] = questionId.split(':');
  return {
    categoryId,
    questionIndex: parseInt(indexStr, 10),
  };
}

export default function useGameState(gameId: string, playerId: string) {
  const [game, setGame] = useState<ExpandedGame | null>(null);
  const [boardMembers, setBoardMembers] = useState<ExpandedMember[]>([]);
  const [eliminatedIds, setEliminatedIds] = useState<string[]>([]);
  const [questionCategories, setQuestionCategories] = useState<ExpandedQuestionCategory[]>([]);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial game state
  useEffect(() => {
    async function fetchGameData() {
      try {
        setLoading(true);
        
        // Fetch game data with explicitly typed results
        const gameData = await client.fetch<ExpandedGame>(`
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
        `, { gameId });
        
        if (!gameData) {
          setError('Game not found');
          setLoading(false);
          return;
        }
        
        setGame(gameData);
        
        // Set board members
        setBoardMembers(gameData.boardMembers || []);
        
        setIsMyTurn(gameData.currentTurn === playerId);
        
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
            playerId
          );
          setEliminatedIds(eliminated);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching game data:', err);
        setError('Failed to load game data');
        setLoading(false);
      }
    }
    
    fetchGameData();
  }, [gameId, playerId]);

  // Function to ask a question
  const askQuestion = async (categoryId: string, questionIndex: number) => {
    if (!game || !isMyTurn) return;
    
    try {
      const category = questionCategories.find(c => c._id === categoryId);
      if (!category || !category.questions || questionIndex >= category.questions.length) {
        console.error('Invalid question');
        return;
      }
      
      const question = category.questions[questionIndex];
      const questionId = generateQuestionId(categoryId, questionIndex);
      
      // Get the target member (opponent's character)
      const playerOneId = game.playerOne._id;
      const playerTwoId = game.playerTwo._id;
      const targetMemberId = playerId === playerOneId
        ? game.playerTwoTarget._id
        : game.playerOneTarget._id;
      
      const targetMember = boardMembers.find(m => m._id === targetMemberId);
      if (!targetMember) {
        console.error('Target member not found');
        return;
      }
      
      // Determine the answer
      const answer = resolveQuestionAnswer(question, targetMember);
      
      // Create a new move
      const newMove: GameMove & { _key: string } = {
        _type: 'gameMove',
        _key: Date.now().toString(),
        playerId,
        playerName: playerId === playerOneId 
          ? game.playerOne.name
          : game.playerTwo.name,
        questionId,
        questionText: question.text,
        timestamp: new Date().toISOString(),
        answer,
      };
      
      // Update game in Sanity
      await client
        .patch(gameId)
        .setIfMissing({ moves: [] })
        .append('moves', [newMove])
        .set({ 
          currentTurn: playerId === playerOneId
            ? playerTwoId 
            : playerOneId
        })
        .commit();
      
      // Update local state
      setIsMyTurn(false);
      
      // Calculate which members to eliminate based on the answer
      const newEliminatedIds = [...eliminatedIds];
      boardMembers.forEach(member => {
        if (!eliminatedIds.includes(member._id)) {
          const memberWouldAnswer = resolveQuestionAnswer(question, member);
          if (memberWouldAnswer !== answer) {
            newEliminatedIds.push(member._id);
          }
        }
      });
      
      setEliminatedIds(newEliminatedIds);
      
    } catch (err) {
      console.error('Error asking question:', err);
    }
  };

  // Helper function to calculate eliminated members
  const calculateEliminatedMembers = (
    moves: Array<GameMove & { _key: string }>,
    members: ExpandedMember[],
    categories: ExpandedQuestionCategory[],
    currentPlayerId: string
  ): string[] => {
    if (!moves || !Array.isArray(moves)) return [];
    
    const eliminated: string[] = [];
    
    // Filter moves to only include the current player's moves
    const playerMoves = moves.filter(move => move.playerId === currentPlayerId);
    
    // For each member, check if they would have been eliminated by any move
    members.forEach(member => {
      for (const move of playerMoves) {
        if (!move.questionId) continue;
        
        const { categoryId, questionIndex } = parseQuestionId(move.questionId);
        const category = categories.find(c => c._id === categoryId);
        if (!category || !category.questions) continue;
        
        const question = category.questions[questionIndex];
        if (!question) continue;
        
        const memberWouldAnswer = resolveQuestionAnswer(question, member);
        if (memberWouldAnswer !== move.answer) {
          eliminated.push(member._id);
          break;
        }
      }
    });
    
    return eliminated;
  };

  // Make a guess
  const makeGuess = async (memberId: string) => {
    if (!game || !isMyTurn) return;
    
    try {
      const playerOneId = game.playerOne._id;
      const playerTwoId = game.playerTwo._id;
      const targetMemberId = playerId === playerOneId
        ? game.playerTwoTarget._id
        : game.playerOneTarget._id;
      
      const isCorrect = memberId === targetMemberId;
      
      if (isCorrect) {
        // End the game
        await client
          .patch(gameId)
          .set({ 
            status: 'completed',
            winner: playerId,
            endedAt: new Date().toISOString()
          })
          .commit();
          
        // Update local state
        setGame(prev => prev ? {...prev, status: 'completed', winner: playerId} : null);
      } else {
        // Wrong guess, switch turns
        await client
          .patch(gameId)
          .set({ 
            currentTurn: playerId === playerOneId
              ? playerTwoId 
              : playerOneId
          })
          .commit();
          
        // Update local state
        setIsMyTurn(false);
      }
      
      return isCorrect;
    } catch (err) {
      console.error('Error making guess:', err);
      return false;
    }
  };

  return {
    game,
    boardMembers,
    eliminatedIds,
    questionCategories,
    isMyTurn,
    loading,
    error,
    askQuestion,
    makeGuess
  };
}