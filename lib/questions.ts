import { Member, Question, QuestionCategory } from "@/sanity.types";

/**
 * Resolves the answer for a question based on member data
 */
export function resolveQuestionAnswer(question: Question, member: Member): boolean {
  const { attributePath, attributeValue } = question;
  
  // Navigate the object path (handles nested paths)
  const pathParts = (attributePath ?? '').split('.');
  let value: unknown = member;
  
  for (const part of pathParts) {
    if (value === undefined || value === null) return false;
    value = (value as Record<string, unknown>)[part];
  }
  
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

/**
 * Filters the available questions for a game based on the current board
 * Only returns questions that would be meaningful (i.e., would split the board)
 */
export function getRelevantQuestions(
  categories: QuestionCategory[],
  boardMembers: Member[]
): { category: QuestionCategory; questions: Question[] }[] {
  return categories.map(category => {
    const relevantQuestions = (category.questions || []).filter(question => {
      // Count how many members would answer yes to this question
      const yesCount = boardMembers.filter(member => 
        resolveQuestionAnswer(question, member)
      ).length;
      
      // Only include if the question would split the board somewhat evenly
      // (at least 25% yes and at least 25% no)
      const percentage = yesCount / boardMembers.length;
      return percentage >= 0.25 && percentage <= 0.75;
    });
    
    return {
      category,
      questions: relevantQuestions,
    };
  }).filter(item => item.questions.length > 0);
}

/**
 * Generate a unique question ID for reference
 */
export function generateQuestionId(categoryId: string, questionIndex: number): string {
  return `${categoryId}:${questionIndex}`;
}

/**
 * Parse a question ID to get the category ID and question index
 */
export function parseQuestionId(questionId: string): { categoryId: string; questionIndex: number } {
  const [categoryId, indexStr] = questionId.split(':');
  return {
    categoryId,
    questionIndex: parseInt(indexStr, 10),
  };
}


