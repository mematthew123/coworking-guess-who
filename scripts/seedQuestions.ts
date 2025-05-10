import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '0e1e02q1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const professionalQuestions = [
  {
    text: "Does this person work in technology?",
    attributePath: "profession",
    attributeValue: "developer",
    category: "professional"
  },
  {
    text: "Is this person a designer?",
    attributePath: "profession",
    attributeValue: "designer",
    category: "professional"
  },
  {
    text: "Does this person have management experience?",
    attributePath: "workspacePreferences.isManager",
    category: "professional"
  },
  // Add more professional questions
];

const personalQuestions = [
  {
    text: "Is this person a morning person?",
    attributePath: "workspacePreferences.morningPerson",
    category: "personal"
  },
  {
    text: "Does this person attend community events?",
    attributePath: "workspacePreferences.attendsEvents",
    category: "personal"
  },
  // Add more personal questions
];

const skillsQuestions = [
  {
    text: "Does this person know JavaScript?",
    attributePath: "skills",
    attributeValue: "JavaScript",
    category: "skills"
  },
  {
    text: "Is this person familiar with UI/UX design?",
    attributePath: "skills",
    attributeValue: "UI/UX",
    category: "skills"
  },
  // Add more skills questions
];

async function seedQuestions() {
  try {
    // Create Professional Category
    const professionalCategory = await client.create({
      _type: 'questionCategory',
      title: 'Professional Background',
      description: 'Questions about work history and professional experience',
      icon: 'briefcase',
      questions: professionalQuestions.map(q => ({
        _key: Math.random().toString(36).substring(2, 9),
        ...q
      }))
    });
    
    // Create Personal Category
    const personalCategory = await client.create({
      _type: 'questionCategory',
      title: 'Personal Preferences',
      description: 'Questions about personal habits and preferences',
      icon: 'user',
      questions: personalQuestions.map(q => ({
        _key: Math.random().toString(36).substring(2, 9),
        ...q
      }))
    });
    
    // Create Skills Category
    const skillsCategory = await client.create({
      _type: 'questionCategory',
      title: 'Skills & Expertise',
      description: 'Questions about technical skills and expertise',
      icon: 'code',
      questions: skillsQuestions.map(q => ({
        _key: Math.random().toString(36).substring(2, 9),
        ...q
      }))
    });
    
    console.log('Question categories created successfully!');
    console.log('Professional category ID:', professionalCategory._id);
    console.log('Personal category ID:', personalCategory._id);
    console.log('Skills category ID:', skillsCategory._id);
  } catch (error) {
    console.error('Error seeding questions:', error);
  }
}

seedQuestions();