import { Question } from '@/../../sanity.types';
import { ExpandedMember, ExpandedQuestionCategory } from '../types/groqResults';


/**
 * Get a nested property from an object using a path string
 * e.g. "workspacePreferences.morningPerson"
 */
export function getNestedProperty(obj: Record<string, any>, path: string): any {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  
  return current;
}

/**
 * Resolves whether a member matches a question's criteria
 */
export function resolveQuestionAnswer(question: Question, member: ExpandedMember): boolean {
  if (!question.attributePath) return false;
  
  // Get the property value
  const value = getNestedProperty(member, question.attributePath);
  
  // Different attribute types require different comparisons
  if (Array.isArray(value)) {
    // For arrays (like skills, interests)
    return question.attributeValue 
      ? value.some(item => 
          typeof item === 'string' 
            ? item.toLowerCase() === question.attributeValue?.toLowerCase() 
            : item === question.attributeValue
        ) 
      : false;
  } else if (typeof value === 'boolean') {
    // For boolean properties
    return value === true;
  } else if (typeof value === 'string') {
    // For string properties
    return question.attributeValue 
      ? value.toLowerCase() === question.attributeValue.toLowerCase() 
      : false;
  } else if (typeof value === 'number') {
    // For numeric properties
    return question.attributeValue 
      ? value === Number(question.attributeValue) 
      : false;
  }
  
  return false;
}

/**
 * Calculates what percentage of members would answer "yes" to this question
 * Useful for determining if a question is useful (should eliminate some but not all)
 */
export function calculateQuestionEffectiveness(
  question: Question, 
  members: ExpandedMember[]
): number {
  if (!members.length) return 0;
  
  const yesCount = members.filter(member => resolveQuestionAnswer(question, member)).length;
  return yesCount / members.length;
}

/**
 * Generates a question ID from category ID and index
 */
export function generateQuestionId(categoryId: string, questionIndex: number): string {
  return `${categoryId}:${questionIndex}`;
}

/**
 * Parses a question ID back into category ID and index
 */
export function parseQuestionId(questionId: string): { categoryId: string; questionIndex: number } {
  const [categoryId, indexStr] = questionId.split(':');
  return {
    categoryId,
    questionIndex: parseInt(indexStr, 10),
  };
}



/**
 * Finds the most effective questions for the current game state
 * (questions that would eliminate close to half the remaining candidates)
 */
export function findOptimalQuestions(
  categories: ExpandedQuestionCategory[],
  remainingMembers: ExpandedMember[],
  askedQuestionIds: string[] = []
): { categoryId: string; questionIndex: number; effectiveness: number }[] {
  if (!remainingMembers.length || !categories.length) return [];
  
  // Flatten all questions and calculate effectiveness
  const allQuestions = categories.flatMap(category => 
    (category.questions || []).map((question, index) => ({
      categoryId: category._id,
      questionIndex: index,
      question,
      effectiveness: Math.abs(0.5 - calculateQuestionEffectiveness(question, remainingMembers))
    }))
  );
  
  // Filter out already asked questions
  const availableQuestions = allQuestions.filter(q => 
    !askedQuestionIds.includes(generateQuestionId(q.categoryId, q.questionIndex))
  );
  
  // Sort by effectiveness (closest to 50/50 split)
  return availableQuestions
    .sort((a, b) => a.effectiveness - b.effectiveness)
    .map(({ categoryId, questionIndex, effectiveness }) => ({
      categoryId,
      questionIndex,
      effectiveness
    }));
}