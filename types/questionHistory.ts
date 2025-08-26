
export interface QuestionResult {
  questionId: string;
  questionText: string;
  categoryId: string;
  categoryName: string;
  answer: boolean;
  timestamp: string;
  playerId: string;
}

export interface MemberQuestionHistory {
  memberId: string;
  questionsApplied: QuestionResult[];
  eliminatedBy?: QuestionResult;
  isEliminated: boolean;
  matchesAllAnswers: boolean;
}

export interface QuestionImpact {
  questionId: string;
  membersEliminated: string[];
  membersRemaining: string[];
  eliminationPercentage: number;
}

export enum BoardViewMode {
  Normal = 'normal',
  QuestionHistory = 'questionHistory',
  EliminationPath = 'eliminationPath',
  HeatMap = 'heatMap',
  Timeline = 'timeline'
}

export interface CharacterVisualState {
  isEliminated: boolean;
  eliminationReason?: string;
  answerPattern: 'allYes' | 'allNo' | 'mixed' | 'none';
  questionCount: number;
  lastQuestionResult?: boolean;
}