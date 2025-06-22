import { Member, Game, QuestionCategory, Question, GameMove } from '@/sanity.types';

/**
 * Types for GROQ query results with expanded references
 */

// Base expanded member reference
export interface ExpandedMemberReference {
  clerkId: string;
  _id: string;
  name?: string;
}

// Expanded member with all attributes
export interface ExpandedMember {
  _id: string;
  name?: string;
  profession?: string;
  image?: Member['image'];
  skills?: string[];
  interests?: string[];
  workspacePreferences?: {
    prefersQuiet?: boolean;
    morningPerson?: boolean;
    attendsEvents?: boolean;
    preferredArea?: string;
  };
  [key: string]: unknown;
}

// Game with expanded references
export interface ExpandedGame {
  _id: string;
  _type: 'game';
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  startedAt?: string;
  endedAt?: string;
  status?: "active" | "completed" | "abandoned";
  
  // Expanded references
  playerOne: ExpandedMemberReference;
  playerTwo: ExpandedMemberReference;
  playerOneTarget: ExpandedMemberReference;
  playerTwoTarget: ExpandedMemberReference;
  boardMembers: ExpandedMember[];
  
  // Other fields
  currentTurn?: string;
  winner?: string;
  moves?: Array<GameMove & { _key: string }>;
  chat?: Array<{
    senderId?: string;
    senderName?: string;
    message?: string;
    timestamp?: string;
    _type: "chatMessage";
    _key: string;
  }>;
}

// Expanded question category with all its questions
export interface ExpandedQuestionCategory extends Omit<QuestionCategory, 'questions'> {
  questions?: Array<Question & { _key: string }>;
}

/**
 * Helper functions for working with GROQ results
 */

// Safely access nested properties by path string
export function getNestedProperty(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

// Check if a game object is an expanded game
export function isExpandedGame(game: Game | ExpandedGame): game is ExpandedGame {
  return (
    typeof (game as ExpandedGame).playerOne === 'object' && 
    !(game as ExpandedGame).playerOne.hasOwnProperty('_ref')
  );
}