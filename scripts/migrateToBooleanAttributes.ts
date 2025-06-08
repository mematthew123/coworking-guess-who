import { createClient } from '@sanity/client';


const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2023-05-03',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
});

// Mapping rules for migration
const PROFESSION_MAPPINGS: Record<string, string[]> = {
    // Tech-related professions
    'software developer': ['isInTech', 'isDeveloper'],
    'web developer': ['isInTech', 'isDeveloper'],
    'frontend developer': ['isInTech', 'isDeveloper'],
    'backend developer': ['isInTech', 'isDeveloper'],
    'full stack developer': ['isInTech', 'isDeveloper'],
    developer: ['isInTech', 'isDeveloper'],
    engineer: ['isInTech'],
    'software engineer': ['isInTech', 'isDeveloper'],
    'data scientist': ['isInTech'],
    'data analyst': ['isInTech'],
    devops: ['isInTech'],

    // Design professions
    designer: ['isDesigner'],
    'ux designer': ['isDesigner', 'isInTech'],
    'ui designer': ['isDesigner', 'isInTech'],
    'graphic designer': ['isDesigner'],
    'product designer': ['isDesigner', 'isInTech'],
    'web designer': ['isDesigner', 'isInTech'],

    // Management
    manager: ['isManager'],
    'product manager': ['isManager', 'isInTech'],
    'project manager': ['isManager'],
    ceo: ['isManager', 'hasStartup'],
    founder: ['isManager', 'hasStartup'],
    'co-founder': ['isManager', 'hasStartup'],

    // Marketing
    marketer: ['isInMarketing'],
    marketing: ['isInMarketing'],
    'digital marketer': ['isInMarketing', 'isInTech'],
    'content creator': ['isInMarketing'],
    'social media': ['isInMarketing'],

    // Freelance/Consultant
    freelance: ['isFreelancer'],
    freelancer: ['isFreelancer'],
    consultant: ['isFreelancer'],
    contractor: ['isFreelancer'],
};

const SKILL_MAPPINGS: Record<string, string> = {
    // Programming languages
    javascript: 'knowsJavaScript',
    js: 'knowsJavaScript',
    node: 'knowsJavaScript',
    nodejs: 'knowsJavaScript',
    python: 'knowsPython',
    react: 'knowsReact',
    reactjs: 'knowsReact',
    'react.js': 'knowsReact',

    // AI/ML
    ai: 'knowsAI',
    ml: 'knowsAI',
    'machine learning': 'knowsAI',
    'artificial intelligence': 'knowsAI',
    'data science': 'knowsAI',

    // Design tools
    figma: 'knowsDesignTools',
    sketch: 'knowsDesignTools',
    adobe: 'knowsDesignTools',
    photoshop: 'knowsDesignTools',
    illustrator: 'knowsDesignTools',
    'ui/ux': 'knowsDesignTools',
    ui: 'knowsDesignTools',
    ux: 'knowsDesignTools',

    // Data
    'data analysis': 'knowsDataAnalysis',
    analytics: 'knowsDataAnalysis',
    sql: 'knowsDataAnalysis',
    excel: 'knowsDataAnalysis',
    tableau: 'knowsDataAnalysis',
};

const INTEREST_MAPPINGS: Record<string, string> = {
    // Activities
    coffee: 'likesCoffee',
    yoga: 'doesYoga',
    meditation: 'doesYoga',
    music: 'playsMusic',
    guitar: 'playsMusic',
    piano: 'playsMusic',
    photography: 'doesPhotography',
    photo: 'doesPhotography',
    art: 'doesArt',
    painting: 'doesArt',
    drawing: 'doesArt',
    crafts: 'doesArt',

    // Sports & Outdoors
    hiking: 'likesHiking',
    outdoors: 'likesHiking',
    camping: 'likesHiking',
    sports: 'doesSports',
    running: 'doesSports',
    cycling: 'doesSports',
    gym: 'doesSports',
    fitness: 'doesSports',

    // Entertainment
    gaming: 'playsVideoGames',
    'video games': 'playsVideoGames',
    games: 'playsVideoGames',
    reading: 'readsBooks',
    books: 'readsBooks',
    anime: 'watchesAnime',
    manga: 'watchesAnime',
    'board games': 'likesBoardGames',
    boardgames: 'likesBoardGames',
};

interface WorkspacePreferences {
    morningPerson?: boolean;
    prefersQuiet?: boolean;
    attendsEvents?: boolean;
    preferredArea?:
        | 'hotDesk'
        | 'quietZone'
        | 'meetingArea'
        | 'phoneBooth'
        | string;
}

interface Member {
    _id: string;
    name: string;
    profession?: string;
    company?: string;
    skills?: string[];
    interests?: string[];
    joinDate?: string;
    bio?: string;
    workspacePreferences?: WorkspacePreferences;
}

async function migrateMember(member: Member) {
    interface Updates {
        professionalAttributes: {
            isInTech: boolean;
            isDesigner: boolean;
            isDeveloper: boolean;
            isManager: boolean;
            isFreelancer: boolean;
            isRemote: boolean;
            hasStartup: boolean;
            isInMarketing: boolean;
        };
        technicalSkills: {
            knowsJavaScript: boolean;
            knowsPython: boolean;
            knowsReact: boolean;
            knowsAI: boolean;
            knowsDesignTools: boolean;
            knowsDataAnalysis: boolean;
        };
        personalTraits: {
            isMorningPerson: boolean;
            prefersQuiet: boolean;
            attendsEvents: boolean;
            likesCoffee: boolean;
            isVegetarian: boolean;
            hasPets: boolean;
            playsMusic: boolean;
            doesYoga: boolean;
        };
        workStyle: {
            usesHotDesk: boolean;
            usesQuietZone: boolean;
            usesMeetingRooms: boolean;
            worksWeekends: boolean;
            takesCallsOften: boolean;
            wearsHeadphones: boolean;
        };
        hobbies: {
            playsVideoGames: boolean;
            doesSports: boolean;
            likesHiking: boolean;
            readsBooks: boolean;
            watchesAnime: boolean;
            doesPhotography: boolean;
            likesBoardGames: boolean;
            doesArt: boolean;
        };
        experience: {
            isNewMember: boolean;
            isVeteranMember: boolean;
            isUnder30: boolean;
            hasKids: boolean;
            speaksMultipleLanguages: boolean;
            hasLivedAbroad: boolean;
        };
    }

    const updates: Updates = {
        // Initialize all attribute categories
        professionalAttributes: {
            isInTech: false,
            isDesigner: false,
            isDeveloper: false,
            isManager: false,
            isFreelancer: false,
            isRemote: false,
            hasStartup: false,
            isInMarketing: false,
        },
        technicalSkills: {
            knowsJavaScript: false,
            knowsPython: false,
            knowsReact: false,
            knowsAI: false,
            knowsDesignTools: false,
            knowsDataAnalysis: false,
        },
        personalTraits: {
            isMorningPerson:
                member.workspacePreferences?.morningPerson || false,
            prefersQuiet: member.workspacePreferences?.prefersQuiet || false,
            attendsEvents: member.workspacePreferences?.attendsEvents || false,
            likesCoffee: false,
            isVegetarian: false,
            hasPets: false,
            playsMusic: false,
            doesYoga: false,
        },
        workStyle: {
            usesHotDesk:
                member.workspacePreferences?.preferredArea === 'hotDesk',
            usesQuietZone:
                member.workspacePreferences?.preferredArea === 'quietZone',
            usesMeetingRooms:
                member.workspacePreferences?.preferredArea === 'meetingArea',
            worksWeekends: false,
            takesCallsOften:
                member.workspacePreferences?.preferredArea === 'phoneBooth',
            wearsHeadphones: false,
        },
        hobbies: {
            playsVideoGames: false,
            doesSports: false,
            likesHiking: false,
            readsBooks: false,
            watchesAnime: false,
            doesPhotography: false,
            likesBoardGames: false,
            doesArt: false,
        },
        experience: {
            isNewMember: false,
            isVeteranMember: false,
            isUnder30: false,
            hasKids: false,
            speaksMultipleLanguages: false,
            hasLivedAbroad: false,
        },
    };

    // Process profession
    if (member.profession) {
        const professionLower = member.profession.toLowerCase();

        // Check for remote work indicators
        if (professionLower.includes('remote')) {
            updates.professionalAttributes.isRemote = true;
        }

        // Apply profession mappings
        for (const [keyword, attributes] of Object.entries(
            PROFESSION_MAPPINGS,
        )) {
            if (professionLower.includes(keyword)) {
                attributes.forEach((attr) => {
                    updates.professionalAttributes[
                        attr as keyof typeof updates.professionalAttributes
                    ] = true;
                });
            }
        }
    }

    // Process skills
    if (member.skills && Array.isArray(member.skills)) {
        member.skills.forEach((skill: string) => {
            const skillLower = skill.toLowerCase();

            for (const [keyword, attribute] of Object.entries(SKILL_MAPPINGS)) {
                if (skillLower.includes(keyword)) {
                    updates.technicalSkills[
                        attribute as keyof typeof updates.technicalSkills
                    ] = true;
                }
            }
        });
    }

    // Process interests
    if (member.interests && Array.isArray(member.interests)) {
        member.interests.forEach((interest: string) => {
            const interestLower = interest.toLowerCase();

            for (const [keyword, attribute] of Object.entries(
                INTEREST_MAPPINGS,
            )) {
                if (interestLower.includes(keyword)) {
                    const category = [
                        'likesCoffee',
                        'doesYoga',
                        'playsMusic',
                        'doesPhotography',
                        'doesArt',
                    ].includes(attribute)
                        ? 'personalTraits'
                        : 'hobbies';
                    (updates[category] as Record<string, boolean>)[attribute] =
                        true;
                }
            }

            // Check for vegetarian/vegan
            if (
                interestLower.includes('vegetarian') ||
                interestLower.includes('vegan')
            ) {
                updates.personalTraits.isVegetarian = true;
            }

            // Check for pets
            if (
                interestLower.includes('pet') ||
                interestLower.includes('dog') ||
                interestLower.includes('cat')
            ) {
                updates.personalTraits.hasPets = true;
            }
        });
    }

    // Process join date for experience
    if (member.joinDate) {
        const joinDate = new Date(member.joinDate);
        const now = new Date();
        const monthsDiff =
            (now.getFullYear() - joinDate.getFullYear()) * 12 +
            (now.getMonth() - joinDate.getMonth());

        if (monthsDiff <= 3) {
            updates.experience.isNewMember = true;
        } else if (monthsDiff >= 12) {
            updates.experience.isVeteranMember = true;
        }
    }

    // Check bio for additional hints
    if (member.bio) {
        const bioLower = member.bio.toLowerCase();

        if (bioLower.includes('weekend')) {
            updates.workStyle.worksWeekends = true;
        }

        if (bioLower.includes('headphone')) {
            updates.workStyle.wearsHeadphones = true;
        }

        if (
            bioLower.includes('languages') ||
            bioLower.includes('multilingual')
        ) {
            updates.experience.speaksMultipleLanguages = true;
        }

        if (bioLower.includes('abroad') || bioLower.includes('expat')) {
            updates.experience.hasLivedAbroad = true;
        }

        if (
            bioLower.includes('kids') ||
            bioLower.includes('children') ||
            bioLower.includes('parent')
        ) {
            updates.experience.hasKids = true;
        }
    }

    return updates;
}

async function runMigration() {
    try {
        console.log('Starting migration to boolean attributes...');

        // Fetch all members
        const members = await client.fetch(`*[_type == "member"]`);
        console.log(`Found ${members.length} members to migrate`);

        let successCount = 0;
        let errorCount = 0;

        for (const member of members) {
            try {
                console.log(`Migrating member: ${member.name} (${member._id})`);

                // Generate new boolean attributes
                const updates = await migrateMember(member);

                // Update the member document
                await client.patch(member._id).set(updates).commit();

                successCount++;
                console.log(`✓ Successfully migrated ${member.name}`);
            } catch (error) {
                errorCount++;
                console.error(`✗ Error migrating ${member.name}:`, error);
            }
        }

        console.log('\n=== Migration Complete ===');
        console.log(`Successfully migrated: ${successCount} members`);
        console.log(`Errors: ${errorCount} members`);

        // Now migrate questions
        console.log('\nMigrating question categories...');
        await migrateQuestions();
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

async function migrateQuestions() {
    // Define sample questions directly in the migration
    type CategoryKey =
        | 'professional'
        | 'technical'
        | 'personal'
        | 'workstyle'
        | 'hobbies'
        | 'experience';

    const sampleQuestions: Record<
        CategoryKey,
        { text: string; attributePath: string }[]
    > = {
        professional: [
            {
                text: 'Do they work in technology?',
                attributePath: 'professionalAttributes.isInTech',
            },
            {
                text: 'Are they a designer?',
                attributePath: 'professionalAttributes.isDesigner',
            },
            {
                text: 'Are they a developer?',
                attributePath: 'professionalAttributes.isDeveloper',
            },
            {
                text: 'Do they have a management role?',
                attributePath: 'professionalAttributes.isManager',
            },
            {
                text: 'Are they a freelancer or consultant?',
                attributePath: 'professionalAttributes.isFreelancer',
            },
            {
                text: 'Do they work fully remote?',
                attributePath: 'professionalAttributes.isRemote',
            },
            {
                text: 'Do they run a startup?',
                attributePath: 'professionalAttributes.hasStartup',
            },
            {
                text: 'Do they work in marketing?',
                attributePath: 'professionalAttributes.isInMarketing',
            },
        ],
        technical: [
            {
                text: 'Do they know JavaScript?',
                attributePath: 'technicalSkills.knowsJavaScript',
            },
            {
                text: 'Do they know Python?',
                attributePath: 'technicalSkills.knowsPython',
            },
            {
                text: 'Do they know React?',
                attributePath: 'technicalSkills.knowsReact',
            },
            {
                text: 'Do they work with AI or Machine Learning?',
                attributePath: 'technicalSkills.knowsAI',
            },
            {
                text: 'Do they use design tools like Figma?',
                attributePath: 'technicalSkills.knowsDesignTools',
            },
            {
                text: 'Do they do data analysis?',
                attributePath: 'technicalSkills.knowsDataAnalysis',
            },
        ],
        personal: [
            {
                text: 'Are they a morning person?',
                attributePath: 'personalTraits.isMorningPerson',
            },
            {
                text: 'Do they prefer quiet workspaces?',
                attributePath: 'personalTraits.prefersQuiet',
            },
            {
                text: 'Do they regularly attend community events?',
                attributePath: 'personalTraits.attendsEvents',
            },
            {
                text: 'Are they a coffee enthusiast?',
                attributePath: 'personalTraits.likesCoffee',
            },
            {
                text: 'Are they vegetarian or vegan?',
                attributePath: 'personalTraits.isVegetarian',
            },
            {
                text: 'Do they have pets?',
                attributePath: 'personalTraits.hasPets',
            },
            {
                text: 'Do they play a musical instrument?',
                attributePath: 'personalTraits.playsMusic',
            },
            {
                text: 'Do they practice yoga or meditation?',
                attributePath: 'personalTraits.doesYoga',
            },
        ],
        workstyle: [
            {
                text: 'Do they usually work from the hot desk area?',
                attributePath: 'workStyle.usesHotDesk',
            },
            {
                text: 'Do they usually work in the quiet zone?',
                attributePath: 'workStyle.usesQuietZone',
            },
            {
                text: 'Do they frequently book meeting rooms?',
                attributePath: 'workStyle.usesMeetingRooms',
            },
            {
                text: 'Do they sometimes work on weekends?',
                attributePath: 'workStyle.worksWeekends',
            },
            {
                text: 'Do they take many phone or video calls?',
                attributePath: 'workStyle.takesCallsOften',
            },
            {
                text: 'Do they usually wear headphones while working?',
                attributePath: 'workStyle.wearsHeadphones',
            },
        ],
        hobbies: [
            {
                text: 'Do they play video games?',
                attributePath: 'hobbies.playsVideoGames',
            },
            {
                text: 'Do they play sports regularly?',
                attributePath: 'hobbies.doesSports',
            },
            {
                text: 'Do they enjoy hiking or outdoor activities?',
                attributePath: 'hobbies.likesHiking',
            },
            {
                text: 'Are they an avid reader?',
                attributePath: 'hobbies.readsBooks',
            },
            {
                text: 'Do they watch anime or read manga?',
                attributePath: 'hobbies.watchesAnime',
            },
            {
                text: 'Are they into photography?',
                attributePath: 'hobbies.doesPhotography',
            },
            {
                text: 'Do they enjoy board games?',
                attributePath: 'hobbies.likesBoardGames',
            },
            {
                text: 'Do they create art or crafts?',
                attributePath: 'hobbies.doesArt',
            },
        ],
        experience: [
            {
                text: 'Did they join within the last 3 months?',
                attributePath: 'experience.isNewMember',
            },
            {
                text: 'Have they been a member for over a year?',
                attributePath: 'experience.isVeteranMember',
            },
            {
                text: 'Are they under 30 years old?',
                attributePath: 'experience.isUnder30',
            },
            {
                text: 'Do they have children?',
                attributePath: 'experience.hasKids',
            },
            {
                text: 'Do they speak 3 or more languages?',
                attributePath: 'experience.speaksMultipleLanguages',
            },
            {
                text: 'Have they lived abroad?',
                attributePath: 'experience.hasLivedAbroad',
            },
        ],
    };

    try {
        // Delete old question categories
        const oldCategories = await client.fetch(
            `*[_type == "questionCategory"]._id`,
        );
        console.log(
            `Removing ${oldCategories.length} old question categories...`,
        );

        for (const id of oldCategories) {
            await client.delete(id);
        }

        // Create new categories with boolean questions
        const categories = [
            {
                title: 'Professional Background',
                description: 'Questions about work and career',
                icon: 'briefcase',
                category: 'professional',
            },
            {
                title: 'Technical Skills',
                description: 'Questions about technical abilities',
                icon: 'code',
                category: 'technical',
            },
            {
                title: 'Personal Traits',
                description: 'Questions about personal preferences',
                icon: 'user',
                category: 'personal',
            },
            {
                title: 'Work Style',
                description: 'Questions about how they work',
                icon: 'clock',
                category: 'workstyle',
            },
            {
                title: 'Hobbies & Interests',
                description: 'Questions about leisure activities',
                icon: 'heart',
                category: 'hobbies',
            },
            {
                title: 'Experience & Background',
                description: 'Questions about life experience',
                icon: 'globe',
                category: 'experience',
            },
        ];
        for (const categoryData of categories) {
            const questions =
                sampleQuestions[categoryData.category as CategoryKey] || [];

            await client.create({
                _type: 'questionCategory',
                title: categoryData.title,
                description: categoryData.description,
                icon: categoryData.icon,
                questions: questions.map((q) => ({
                    _key: Math.random().toString(36).substring(2, 9),
                    _type: 'question',
                    text: q.text,
                    attributePath: q.attributePath,
                    category: categoryData.category,
                })),
            });

            console.log(
                `✓ Created category: ${categoryData.title} with ${questions.length} questions`,
            );
        }

        console.log('\n✓ Question migration complete!');
    } catch (error) {
        console.error('Error migrating questions:', error);
    }
}

// Run the migration
runMigration();