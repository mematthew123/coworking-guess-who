/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/question-utils.ts
import { Question } from '@/sanity.types';
import { ExpandedMember, ExpandedQuestionCategory } from '@/types/groqResults';

/**
 * Simplified answer resolution - always returns boolean
 */
export function resolveQuestionAnswer(
  question: Question, 
  member: ExpandedMember
): boolean {
  if (!question.attributePath) return false;
  
  // Split path (e.g., "professionalAttributes.isInTech")
  const pathParts = question.attributePath.split('.');
  let value: any = member;
  
  // Navigate to the boolean value
  for (const part of pathParts) {
    if (value === undefined || value === null) return false;
    value = value[part];
  }
  
  // For boolean attributes, simply return the value
  return value === true;
}

/**
 * Calculate how effective a question is (how evenly it splits remaining members)
 */
export function calculateQuestionEffectiveness(
  question: Question,
  remainingMembers: ExpandedMember[]
): number {
  if (!remainingMembers.length) return 0;
  
  const yesCount = remainingMembers.filter(member => 
    resolveQuestionAnswer(question, member)
  ).length;
  
  const percentage = yesCount / remainingMembers.length;
  
  // Best effectiveness is 50/50 split (0.5)
  // Return how far from 0.5 this question is
  return Math.abs(0.5 - percentage);
}

/**
 * Filter members based on a question and answer
 */
export function filterMembersByAnswer(
  members: ExpandedMember[],
  question: Question,
  answer: boolean
): ExpandedMember[] {
  return members.filter(member => 
    resolveQuestionAnswer(question, member) === answer
  );
}

/**
 * Get question statistics for UI display
 */
export function getQuestionStats(
  question: Question,
  members: ExpandedMember[]
): {
  yesCount: number;
  noCount: number;
  effectiveness: number;
  isOptimal: boolean;
} {
  const yesCount = members.filter(m => resolveQuestionAnswer(question, m)).length;
  const noCount = members.length - yesCount;
  const effectiveness = calculateQuestionEffectiveness(question, members);
  
  return { 
    yesCount, 
    noCount, 
    effectiveness,
    isOptimal: effectiveness < 0.15 // Within 15% of perfect split
  };
}

/**
 * Calculate all eliminated members from game history
 */
export function calculateEliminatedFromHistory(
  moves: Array<{ questionId?: string; answer?: boolean; playerId?: string }>,
  allMembers: ExpandedMember[],
  questionCategories: ExpandedQuestionCategory[],
  currentPlayerId: string
): string[] {
  const remainingIds = new Set(allMembers.map(m => m._id));
  
  // Only process moves from the current player
  const playerMoves = moves.filter(move => move.playerId === currentPlayerId);
  
  playerMoves.forEach(move => {
    if (!move.questionId || move.answer === undefined) return;
    
    // Parse questionId format: "categoryId:questionIndex"
    const [categoryId, indexStr] = move.questionId.split(':');
    const questionIndex = parseInt(indexStr, 10);
    
    // Find the question
    const category = questionCategories.find(c => c._id === categoryId);
    const question = category?.questions?.[questionIndex];
    
    if (!question) return;
    
    // Remove members who would answer differently
    allMembers.forEach(member => {
      if (remainingIds.has(member._id)) {
        const memberAnswer = resolveQuestionAnswer(question, member);
        if (memberAnswer !== move.answer) {
          remainingIds.delete(member._id);
        }
      }
    });
  });
  
  // Return array of eliminated IDs
  return allMembers
    .map(m => m._id)
    .filter(id => !remainingIds.has(id));
}

/**
 * Calculate eliminations for a single question
 */
export function calculateEliminations(
  question: Question,
  answer: boolean,
  members: ExpandedMember[]
): number {
  return members.filter(member => 
    resolveQuestionAnswer(question, member) !== answer
  ).length;
}

/**
 * Process a game move and return eliminated member IDs
 */
export function processGameMove(
  question: Question,
  answer: boolean,
  allMembers: ExpandedMember[],
  currentlyRemainingIds: string[]
): string[] {
  const eliminatedIds: string[] = [];
  
  allMembers.forEach(member => {
    if (currentlyRemainingIds.includes(member._id)) {
      const memberAnswer = resolveQuestionAnswer(question, member);
      if (memberAnswer !== answer) {
        eliminatedIds.push(member._id);
      }
    }
  });
  
  return eliminatedIds;
}

/**
 * Suggest optimal questions based on remaining members
 */
export function getSuggestedQuestions(
  availableQuestions: Question[],
  remainingMembers: ExpandedMember[],
  limit: number = 5
): Question[] {
  // Calculate effectiveness for each question
  const questionsWithStats = availableQuestions.map(question => ({
    question,
    effectiveness: calculateQuestionEffectiveness(question, remainingMembers)
  }));
  
  // Sort by effectiveness (lower is better - closer to 50/50 split)
  questionsWithStats.sort((a, b) => a.effectiveness - b.effectiveness);
  
  // Return top questions
  return questionsWithStats
    .slice(0, limit)
    .map(item => item.question);
}

/**
 * Game state tracker for managing eliminations
 */
export class GameStateTracker {
  private remainingMembers: Set<string>;
  private eliminationHistory: Array<{
    questionId: string;
    answer: boolean;
    eliminated: string[];
  }> = [];
  
  constructor(initialMembers: ExpandedMember[]) {
    this.remainingMembers = new Set(initialMembers.map(m => m._id));
  }
  
  applyQuestion(
    question: Question,
    answer: boolean,
    allMembers: ExpandedMember[]
  ): string[] {
    const eliminated: string[] = [];
    
    allMembers.forEach(member => {
      if (this.remainingMembers.has(member._id)) {
        const memberAnswer = resolveQuestionAnswer(question, member);
        
        // Eliminate if answer doesn't match
        if (memberAnswer !== answer) {
          this.remainingMembers.delete(member._id);
          eliminated.push(member._id);
        }
      }
    });
    
    this.eliminationHistory.push({
      questionId: question.attributePath || '',
      answer,
      eliminated
    });
    
    return eliminated;
  }
  
  getRemainingMembers(): string[] {
    return Array.from(this.remainingMembers);
  }
  
  getRemainingCount(): number {
    return this.remainingMembers.size;
  }
  
  canUndo(): boolean {
    return this.eliminationHistory.length > 0;
  }
  
  undo(): void {
    const lastAction = this.eliminationHistory.pop();
    if (lastAction) {
      // Re-add eliminated members
      lastAction.eliminated.forEach(id => this.remainingMembers.add(id));
    }
  }
}