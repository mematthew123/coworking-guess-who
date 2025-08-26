import { useMemo } from 'react';
import { ExpandedMember, ExpandedQuestionCategory } from '@/types/groqResults';
import { MemberQuestionHistory, QuestionResult, QuestionImpact } from '@/types/questionHistory';
import { resolveQuestionAnswer } from '@/lib/question-utils';

interface GameMove {
  playerId?: string;
  playerName?: string;
  questionId?: string;
  questionText?: string;
  answer?: boolean;
  timestamp?: string;
}

export function useQuestionHistory(
  boardMembers: ExpandedMember[],
  moves: GameMove[],
  categories: ExpandedQuestionCategory[],
  currentPlayerId: string
) {
  // Calculate question history for each member
  const memberHistories = useMemo(() => {
    const histories: Map<string, MemberQuestionHistory> = new Map();
    
    // Initialize history for each board member
    boardMembers.forEach(member => {
      histories.set(member._id, {
        memberId: member._id,
        questionsApplied: [],
        isEliminated: false,
        matchesAllAnswers: true
      });
    });
    
    // Process each move
    const playerMoves = moves.filter(move => move.playerId === currentPlayerId);
    
    playerMoves.forEach(move => {
      if (!move.questionId || move.answer === undefined) return;
      
      // Parse question details
      const [categoryId, indexStr] = move.questionId.split(':');
      const questionIndex = parseInt(indexStr, 10);
      const category = categories.find(c => c._id === categoryId);
      const question = category?.questions?.[questionIndex];
      
      if (!question) return;
      
      const questionResult: QuestionResult = {
        questionId: move.questionId,
        questionText: move.questionText ?? question.text ?? '',
        categoryId,
        categoryName: category.title ?? '',
        answer: move.answer,
        timestamp: move.timestamp || new Date().toISOString(),
        playerId: move.playerId || currentPlayerId
      };
      
      // Apply question to each member
      boardMembers.forEach(member => {
        const history = histories.get(member._id);
        if (!history) return;
        
        const memberAnswer = resolveQuestionAnswer(question, member);
        const matchesAnswer = memberAnswer === move.answer;
        
        history.questionsApplied.push(questionResult);
        
        // If member doesn't match the answer, they're eliminated
        if (!matchesAnswer && history.matchesAllAnswers) {
          history.isEliminated = true;
          history.eliminatedBy = questionResult;
          history.matchesAllAnswers = false;
        }
      });
    });
    
    return histories;
  }, [boardMembers, moves, categories, currentPlayerId]);
  
  // Calculate question impacts
  const questionImpacts = useMemo(() => {
    const impacts: QuestionImpact[] = [];
    const playerMoves = moves.filter(move => move.playerId === currentPlayerId);
    const remainingMembers = new Set(boardMembers.map(m => m._id));
    
    playerMoves.forEach(move => {
      if (!move.questionId || move.answer === undefined) return;
      
      const previousRemaining = new Set(remainingMembers);
      const eliminated: string[] = [];
      
      // Calculate eliminations for this question
      memberHistories.forEach((history, memberId) => {
        if (history.eliminatedBy?.questionId === move.questionId) {
          eliminated.push(memberId);
          remainingMembers.delete(memberId);
        }
      });
      
      impacts.push({
        questionId: move.questionId,
        membersEliminated: eliminated,
        membersRemaining: Array.from(remainingMembers),
        eliminationPercentage: (eliminated.length / previousRemaining.size) * 100
      });
    });
    
    return impacts;
  }, [boardMembers, moves, memberHistories, currentPlayerId]);
  
  // Get visual state for a member
  const getMemberVisualState = (memberId: string) => {
    const history = memberHistories.get(memberId);
    if (!history) return null;
    
    const yesCount = history.questionsApplied.filter(q => q.answer).length;
    const noCount = history.questionsApplied.filter(q => !q.answer).length;
    
    let answerPattern: 'allYes' | 'allNo' | 'mixed' | 'none' = 'none';
    if (history.questionsApplied.length > 0) {
      if (yesCount === history.questionsApplied.length) answerPattern = 'allYes';
      else if (noCount === history.questionsApplied.length) answerPattern = 'allNo';
      else answerPattern = 'mixed';
    }
    
    return {
      isEliminated: history.isEliminated,
      eliminationReason: history.eliminatedBy?.questionText,
      answerPattern,
      questionCount: history.questionsApplied.length,
      lastQuestionResult: history.questionsApplied[history.questionsApplied.length - 1]?.answer
    };
  };
  
  return {
    memberHistories,
    questionImpacts,
    getMemberVisualState,
    totalQuestions: moves.filter(m => m.playerId === currentPlayerId).length,
    eliminatedCount: Array.from(memberHistories.values()).filter(h => h.isEliminated).length
  };
}