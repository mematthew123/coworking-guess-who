#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';


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

// Valid attribute paths based on the new boolean structure
const VALID_ATTRIBUTE_PATHS = {
  professional: [
    'professionalAttributes.isInTech',
    'professionalAttributes.isDesigner',
    'professionalAttributes.isDeveloper',
    'professionalAttributes.isManager',
    'professionalAttributes.isFreelancer',
    'professionalAttributes.isRemote',
    'professionalAttributes.hasStartup',
    'professionalAttributes.isInMarketing',
  ],
  technical: [
    'technicalSkills.knowsJavaScript',
    'technicalSkills.knowsPython',
    'technicalSkills.knowsReact',
    'technicalSkills.worksWithAI',
    'technicalSkills.usesDesignTools',
    'technicalSkills.doesDataAnalysis',
  ],
  personal: [
    'personalTraits.isMorningPerson',
    'personalTraits.prefersQuiet',
    'personalTraits.attendsEvents',
    'personalTraits.drinksCoffee',
    'personalTraits.isVegetarian',
    'personalTraits.hasPets',
    'personalTraits.playsInstrument',
    'personalTraits.doesYoga',
  ],
  workstyle: [
    'workStyle.usesHotDesk',
    'workStyle.usesQuietZone',
    'workStyle.booksMeetingRooms',
    'workStyle.worksWeekends',
    'workStyle.takesCalls',
    'workStyle.wearsHeadphones',
  ],
  hobbies: [
    'hobbies.playsVideoGames',
    'hobbies.playsSports',
    'hobbies.likesOutdoors',
    'hobbies.readsBooks',
    'hobbies.watchesAnime',
    'hobbies.doesPhotography',
    'hobbies.playsBoardGames',
    'hobbies.makesArt',
  ],
  experience: [
    'experience.joinedRecently',
    'experience.isLongTermMember',
    'experience.isUnder30',
    'experience.hasChildren',
    'experience.speaksMultipleLanguages',
    'experience.hasLivedAbroad',
  ],
};

// All valid paths in a flat array
const ALL_VALID_PATHS = Object.values(VALID_ATTRIBUTE_PATHS).flat();

async function validateQuestions() {
  try {
    console.log('🔍 Validating Questions...\n');

    // Fetch all question categories with their questions
    const categories = await client.fetch(`
      *[_type == "questionCategory"]{
        _id,
        title,
        questions[]{
          text,
          attributePath,
          category
        }
      }
    `);

    let totalQuestions = 0;
    let validQuestions = 0;
    let invalidQuestions = 0;
    const issues: string[] = [];

    // Validate each category
    for (const category of categories) {
      console.log(`\n📁 Category: ${category.title}`);
      console.log('─'.repeat(50));

      if (!category.questions || category.questions.length === 0) {
        console.log('  ⚠️  No questions in this category');
        issues.push(`Category "${category.title}" has no questions`);
        continue;
      }

      for (const question of category.questions) {
        totalQuestions++;
        
        // Check if attributePath exists
        if (!question.attributePath) {
          invalidQuestions++;
          console.log(`  ❌ "${question.text}"`);
          console.log(`     Missing attributePath`);
          issues.push(`Question "${question.text}" is missing attributePath`);
          continue;
        }

        // Check if attributePath is valid
        if (!ALL_VALID_PATHS.includes(question.attributePath)) {
          invalidQuestions++;
          console.log(`  ❌ "${question.text}"`);
          console.log(`     Invalid attributePath: ${question.attributePath}`);
          issues.push(`Question "${question.text}" has invalid attributePath: ${question.attributePath}`);
          continue;
        }

        // Check if category matches the attributePath
        const expectedCategory = Object.entries(VALID_ATTRIBUTE_PATHS).find(
          ([, paths]) => paths.includes(question.attributePath)
        )?.[0];

        if (question.category !== expectedCategory) {
          console.log(`  ⚠️  "${question.text}"`);
          console.log(`     Category mismatch: "${question.category}" should be "${expectedCategory}"`);
          issues.push(`Question "${question.text}" has category "${question.category}" but attributePath suggests "${expectedCategory}"`);
        } else {
          validQuestions++;
          console.log(`  ✅ "${question.text}"`);
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Questions: ${totalQuestions}`);
    console.log(`✅ Valid Questions: ${validQuestions}`);
    console.log(`❌ Invalid Questions: ${invalidQuestions}`);
    console.log(`⚠️  Total Issues: ${issues.length}`);

    if (issues.length > 0) {
      console.log('\n🔧 ISSUES TO FIX:');
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    } else {
      console.log('\n✨ All questions are valid!');
    }

    // Additional validation: Check for duplicate questions
    console.log('\n🔍 Checking for duplicate questions...');
    const questionTexts = categories.flatMap((c: any) => c.questions?.map((q: any) => q.text) || []);
    const duplicates = questionTexts.filter((text: string, index: number) => questionTexts.indexOf(text) !== index);
    
    if (duplicates.length > 0) {
      console.log(`⚠️  Found ${duplicates.length} duplicate questions:`);
      [...new Set(duplicates)].forEach(dup => {
        console.log(`   - "${dup}"`);
      });
    } else {
      console.log('✅ No duplicate questions found');
    }

    // Check coverage: Which valid paths don't have questions?
    console.log('\n📋 Checking attribute path coverage...');
    const usedPaths = categories.flatMap((c: any) => 
      c.questions?.map((q: any) => q.attributePath).filter(Boolean) || []
    );
    const unusedPaths = ALL_VALID_PATHS.filter(path => !usedPaths.includes(path));
    
    if (unusedPaths.length > 0) {
      console.log(`⚠️  ${unusedPaths.length} attribute paths have no questions:`);
      unusedPaths.forEach(path => {
        console.log(`   - ${path}`);
      });
    } else {
      console.log('✅ All attribute paths have corresponding questions');
    }

  } catch (error) {
    console.error('❌ Error validating questions:', error);
    process.exit(1);
  }
}

// Run the validation
validateQuestions();