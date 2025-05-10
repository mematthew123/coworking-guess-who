// scripts/seedMembers.ts
import { createClient } from '@sanity/client';





const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '0e1e02q1',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2023-05-03',
    token: 'skZLgWh0JxZGU5iK5V66BvxsOrcd3FXQymTQYmpaeNC6sBKU19Kd3Qq5LMahhLEOqodRLbxVLV03Xg2KIoHJxAFdRlF3zAPcZaTC762h1xjd7ECqZhLPWuAz7aIqoOVdPlzsIZpNZQId1vt81g5YcHLxUG0stRUhC5UkhWgGQR93ckvDgltf',
    useCdn: false,
});

// Sample data for generating realistic members
const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Cameron', 'Dakota', 'Skyler', 'Jamie', 'Sam', 'Blake', 'Reese'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris'];
const professions = ['Software Developer', 'UX Designer', 'Product Manager', 'Digital Marketer', 'Content Creator', 'Data Analyst', 'Graphic Designer', 'Startup Founder', 'Consultant', 'Web Developer', 'SEO Specialist', 'Project Manager', 'Photographer', 'Writer', 'Accountant'];
const companies = ['Freelance', 'TechStartup', 'CreativeStudio', 'ConsultingFirm', 'RemoteFirst', 'DigitalAgency', 'LocalBusiness', 'GreenTech', 'FinTech', 'EdTech', 'HealthTech', 'E-commerce', 'SaaS', 'AI Solutions', 'Analytics Co.'];
const skills = ['JavaScript', 'Python', 'React', 'UI/UX', 'Figma', 'WordPress', 'SEO', 'Content Strategy', 'Data Analysis', 'Social Media', 'Branding', 'Illustration', 'Video Editing', 'Copywriting', 'Public Speaking', 'Leadership', 'Project Management', 'Customer Research', 'Analytics', 'HTML/CSS', 'Node.js', 'TypeScript', 'AWS', 'Marketing', 'Sales'];
const interests = ['Coffee', 'Remote Work', 'Travel', 'Hiking', 'Photography', 'Reading', 'Yoga', 'Tech Meetups', 'Sustainability', 'Cooking', 'Music', 'Art', 'Gaming', 'Cycling', 'Running', 'Podcasts', 'Investing', 'Volunteering', 'Languages', 'Film', 'Design', 'Architecture'];
const areas = ['hotDesk', 'quietZone', 'meetingArea', 'phoneBooth', 'kitchen'];

// Helper function to generate random member data
function generateMember(index: number) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@example.com`;
  
  // Generate 2-5 random skills
  const numSkills = Math.floor(Math.random() * 4) + 2;
  const memberSkills: unknown[] = [];
  for (let i = 0; i < numSkills; i++) {
    const skill = skills[Math.floor(Math.random() * skills.length)];
    if (!memberSkills.includes(skill)) {
      memberSkills.push(skill);
    }
  }
  
  // Generate 2-4 random interests
  const numInterests = Math.floor(Math.random() * 3) + 2;
  const memberInterests: string[] = [];
  for (let i = 0; i < numInterests; i++) {
    const interest = interests[Math.floor(Math.random() * interests.length)];
    if (!memberInterests.includes(interest)) {
      memberInterests.push(interest);
    }
  }
  
  // Set random workspace preferences
  const prefersQuiet = Math.random() > 0.5;
  const morningPerson = Math.random() > 0.5;
  const attendsEvents = Math.random() > 0.7; // 30% chance of attending events
  const preferredArea = areas[Math.floor(Math.random() * areas.length)];
  
  // Calculate join date (between 1 and 365 days ago)
  const daysAgo = Math.floor(Math.random() * 365) + 1;
  const joinDate = new Date();
  joinDate.setDate(joinDate.getDate() - daysAgo);
  
  return {
    _type: 'member',
    name,
    email,
    profession: professions[Math.floor(Math.random() * professions.length)],
    company: companies[Math.floor(Math.random() * companies.length)],
    skills: memberSkills,
    interests: memberInterests,
    workspacePreferences: {
      prefersQuiet,
      morningPerson,
      attendsEvents,
      preferredArea
    },
    joinDate: joinDate.toISOString(),
    gameParticipation: true, // All test members participate in the game
    // Clerk ID field is for real users, we'll leave it out for test data
    bio: `${name} is a ${memberSkills[0]} specialist working at ${companies[Math.floor(Math.random() * companies.length)]}.`,
    socialLinks: {
      linkedin: Math.random() > 0.3 ? `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}` : undefined,
      twitter: Math.random() > 0.6 ? `https://twitter.com/${firstName.toLowerCase()}${lastName.toLowerCase()}` : undefined,
      website: Math.random() > 0.7 ? `https://${firstName.toLowerCase()}${lastName.toLowerCase()}.com` : undefined,
    }
  };
}

async function seedMembers(count = 20) {
  try {
    console.log(`Creating ${count} test members...`);
    
    const members = [];
    
    for (let i = 0; i < count; i++) {
      const member = generateMember(i);
      
      // Create the member in Sanity
      const result = await client.create(member);
      members.push(result);
      
      console.log(`Created member: ${member.name} (${result._id})`);
    }
    
    console.log(`Successfully created ${members.length} test members!`);
    return members;
  } catch (error) {
    console.error('Error seeding members:', error);
  }
}

// Generate 20 test members by default
seedMembers(20).then(() => console.log('Done!'));