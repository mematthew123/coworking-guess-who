#!/usr/bin/env node

import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
});

// Mapping of old attribute paths to new boolean attribute paths
const PATH_MAPPINGS: Record<string, string> = {
  // Old workspace preferences
  'workspacePreferences.morningPerson': 'personalTraits.isMorningPerson',
  'workspacePreferences.attendsEvents': 'personalTraits.attendsEvents',
  'workspacePreferences.prefersQuiet': 'personalTraits.prefersQuiet',
  
  // Old skills array checks
  'skills': 'technicalSkills.knowsJavaScript', // This needs context
  
  // Old profession checks
  'profession': 'professionalAttributes.isDeveloper', // This needs context
  
  // Add more mappings as needed based on what we find
};

// Question text to attribute path mappings for context-aware fixes
const QUESTION_TO_PATH: Record<string, string> = {
  // Professional Background
  'Do they work in technology?': 'professionalAttributes.isInTech',
  'Are they a designer?': 'professionalAttributes.isDesigner',
  'Are they a developer?': 'professionalAttributes.isDeveloper',
  'Do they have a management role?': 'professionalAttributes.isManager',
  'Are they a freelancer or consultant?': 'professionalAttributes.isFreelancer',
  'Do they work fully remote?': 'professionalAttributes.isRemote',
  'Do they run a startup?': 'professionalAttributes.hasStartup',
  'Do they work in marketing?': 'professionalAttributes.isInMarketing',
  
  // Technical Skills
  'Do they know JavaScript?': 'technicalSkills.knowsJavaScript',
  'Do they know Python?': 'technicalSkills.knowsPython',
  'Do they know React?': 'technicalSkills.knowsReact',
  'Do they work with AI or Machine Learning?': 'technicalSkills.worksWithAI',
  'Do they use design tools like Figma?': 'technicalSkills.usesDesignTools',
  'Do they do data analysis?': 'technicalSkills.doesDataAnalysis',
  
  // Personal Traits
  'Are they a morning person?': 'personalTraits.isMorningPerson',
  'Do they prefer quiet workspaces?': 'personalTraits.prefersQuiet',
  'Do they regularly attend community events?': 'personalTraits.attendsEvents',
  'Are they a coffee enthusiast?': 'personalTraits.drinksCoffee',
  'Are they vegetarian or vegan?': 'personalTraits.isVegetarian',
  'Do they have pets?': 'personalTraits.hasPets',
  'Do they play a musical instrument?': 'personalTraits.playsInstrument',
  'Do they practice yoga or meditation?': 'personalTraits.doesYoga',
  
  // Work Style
  'Do they usually work from the hot desk area?': 'workStyle.usesHotDesk',
  'Do they usually work in the quiet zone?': 'workStyle.usesQuietZone',
  'Do they frequently book meeting rooms?': 'workStyle.booksMeetingRooms',
  'Do they sometimes work on weekends?': 'workStyle.worksWeekends',
  'Do they take many phone or video calls?': 'workStyle.takesCalls',
  'Do they usually wear headphones while working?': 'workStyle.wearsHeadphones',
  
  // Hobbies & Interests
  'Do they play video games?': 'hobbies.playsVideoGames',
  'Do they play sports regularly?': 'hobbies.playsSports',
  'Do they enjoy hiking or outdoor activities?': 'hobbies.likesOutdoors',
  'Are they an avid reader?': 'hobbies.readsBooks',
  'Do they watch anime or read manga?': 'hobbies.watchesAnime',
  'Are they into photography?': 'hobbies.doesPhotography',
  'Do they enjoy board games?': 'hobbies.playsBoardGames',
  'Do they create art or crafts?': 'hobbies.makesArt',
  
  // Experience & Background
  'Did they join within the last 3 months?': 'experience.joinedRecently',
  'Have they been a member for over a year?': 'experience.isLongTermMember',
  'Are they under 30 years old?': 'experience.isUnder30',
  'Do they have children?': 'experience.hasChildren',
  'Do they speak 3 or more languages?': 'experience.speaksMultipleLanguages',
  'Have they lived abroad?': 'experience.hasLivedAbroad',
};

// Category mappings based on attribute path prefix
const PATH_TO_CATEGORY: Record<string, string> = {
  'professionalAttributes': 'professional',
  'technicalSkills': 'technical',
  'personalTraits': 'personal',
  'workStyle': 'workstyle',
  'hobbies': 'hobbies',
  'experience': 'experience',
};

async function fixQuestionPaths() {
  try {
    console.log('🔧 Fixing Question Attribute Paths...\n');

    // Fetch all question categories with their questions
    const categories = await client.fetch(`
      *[_type == "questionCategory"]{
        _id,
        title,
        questions[]{
          _key,
          text,
          attributePath,
          category,
          attributeValue,
          difficulty
        }
      }
    `);

    let totalFixed = 0;
    let totalQuestions = 0;

    for (const category of categories) {
      console.log(`\n📁 Processing Category: ${category.title}`);
      console.log('─'.repeat(50));

      if (!category.questions || category.questions.length === 0) {
        console.log('  No questions to process');
        continue;
      }

      const updatedQuestions = [];
      let categoryFixed = 0;

      for (const question of category.questions) {
        totalQuestions++;
        let needsUpdate = false;
        const updates: any = { ...question };

        // Fix attribute path based on question text
        if (QUESTION_TO_PATH[question.text]) {
          const correctPath = QUESTION_TO_PATH[question.text];
          if (question.attributePath !== correctPath) {
            console.log(`  📝 "${question.text}"`);
            console.log(`     Old path: ${question.attributePath || 'none'}`);
            console.log(`     New path: ${correctPath}`);
            updates.attributePath = correctPath;
            needsUpdate = true;
          }
        }

        // Fix category based on attribute path
        if (updates.attributePath) {
          const pathPrefix = updates.attributePath.split('.')[0];
          const correctCategory = PATH_TO_CATEGORY[pathPrefix];
          
          if (correctCategory && question.category !== correctCategory) {
            console.log(`     Category: ${question.category} → ${correctCategory}`);
            updates.category = correctCategory;
            needsUpdate = true;
          }
        }

        // Clear attributeValue for boolean checks (not needed anymore)
        if (updates.attributeValue) {
          console.log(`     Clearing attributeValue: ${updates.attributeValue}`);
          updates.attributeValue = undefined;
          needsUpdate = true;
        }

        if (needsUpdate) {
          categoryFixed++;
          totalFixed++;
        }

        updatedQuestions.push(updates);
      }

      // Update the category document if any questions were fixed
      if (categoryFixed > 0) {
        console.log(`\n  ✅ Updating ${categoryFixed} questions in "${category.title}"...`);
        
        await client
          .patch(category._id)
          .set({ questions: updatedQuestions })
          .commit();
          
        console.log(`  ✅ Updated successfully!`);
      } else {
        console.log(`  ✅ All questions already have correct paths`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 FIX SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Questions Processed: ${totalQuestions}`);
    console.log(`✅ Questions Fixed: ${totalFixed}`);
    console.log(`✨ Questions Already Correct: ${totalQuestions - totalFixed}`);
    
    if (totalFixed > 0) {
      console.log('\n🎉 All question paths have been updated!');
      console.log('Run the validation script to verify: npm run validate-questions');
    } else {
      console.log('\n✨ All questions already have correct attribute paths!');
    }

  } catch (error) {
    console.error('❌ Error fixing question paths:', error);
    process.exit(1);
  }
}

// Run the fix
fixQuestionPaths();