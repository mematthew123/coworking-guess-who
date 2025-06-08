import { defineType, defineField } from 'sanity';

export default defineType({
    name: 'member',
    title: 'Coworking Member',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Full Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: (Rule) => Rule.required().email(),
            description:
                'This will be used for sending notifications and updates and other shit..maybe.',
        }),
        defineField({
            name: 'lastActive',
            title: 'Last Active',
            type: 'datetime',
            description: 'When the user was last active',
            hidden: true,
        }),
        defineField({
            name: 'onlineStatus',
            title: 'Online Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Online', value: 'online' },
                    { title: 'Away', value: 'away' },
                    { title: 'Offline', value: 'offline' },
                ],
            },
            initialValue: 'offline',
            hidden: true,
        }),
        defineField({
            name: 'image',
            title: 'Profile Photo',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'clerkId',
            title: 'Clerk ID',
            type: 'string',
            description: 'ID from Clerk authentication service',
            // Make this hidden in Studio if desired
            hidden: false,
            readOnly: true,
        }),
        defineField({
            name: 'profession',
            title: 'Profession',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'company',
            title: 'Company',
            type: 'string',
        }),
        defineField({
            name: 'skills',
            title: 'Skills',
            type: 'array',
            of: [{ type: 'string' }],
            options: {
                layout: 'tags',
            },
        }),
        defineField({
            name: 'interests',
            title: 'Interests',
            type: 'array',
            of: [{ type: 'string' }],
            options: {
                layout: 'tags',
            },
        }),
        defineField({
            name: 'workspacePreferences',
            title: 'Workspace Preferences',
            type: 'object',
            fields: [
                {
                    name: 'prefersQuiet',
                    title: 'Prefers Quiet Zone',
                    type: 'boolean',
                    initialValue: false,
                },
                {
                    name: 'morningPerson',
                    title: 'Morning Person',
                    type: 'boolean',
                    initialValue: false,
                },
                {
                    name: 'attendsEvents',
                    title: 'Regularly Attends Events',
                    type: 'boolean',
                    initialValue: false,
                },
                {
                    name: 'preferredArea',
                    title: 'Preferred Area',
                    type: 'string',
                    options: {
                        list: [
                            { title: 'Hot Desk', value: 'hotDesk' },
                            { title: 'Quiet Zone', value: 'quietZone' },
                            { title: 'Meeting Area', value: 'meetingArea' },
                            { title: 'Phone Booth', value: 'phoneBooth' },
                            { title: 'Kitchen/Lounge', value: 'kitchen' },
                        ],
                    },
                },
            ],
        }),
        defineField({
            name: 'joinDate',
            title: 'Join Date',
            type: 'date',
            options: {
                dateFormat: 'YYYY-MM-DD',
            },
        }),
        defineField({
            name: 'bio',
            title: 'Bio',
            type: 'text',
            rows: 3,
        }),
        defineField({
            name: 'socialLinks',
            title: 'Social Links',
            type: 'object',
            fields: [
                {
                    name: 'linkedin',
                    title: 'LinkedIn',
                    type: 'url',
                },
                {
                    name: 'twitter',
                    title: 'Twitter',
                    type: 'url',
                },
                {
                    name: 'website',
                    title: 'Website',
                    type: 'url',
                },
            ],
        }),
        defineField({
            name: 'gameParticipation',
            title: 'Participate in Community Game',
            type: 'boolean',
            initialValue: false,
            description:
                'Opt-in to be included in the "Guess Who" community game',
        }),

        defineField({
            name: 'professionalAttributes',
            title: 'Professional Attributes',
            type: 'object',
            fields: [
                {
                    name: 'isInTech',
                    type: 'boolean',
                    title: 'Works in Tech',
                    initialValue: false,
                },
                {
                    name: 'isDesigner',
                    type: 'boolean',
                    title: 'Is a Designer',
                    initialValue: false,
                },
                {
                    name: 'isDeveloper',
                    type: 'boolean',
                    title: 'Is a Developer',
                    initialValue: false,
                },
                {
                    name: 'isManager',
                    type: 'boolean',
                    title: 'Has Management Role',
                    initialValue: false,
                },
                {
                    name: 'isFreelancer',
                    type: 'boolean',
                    title: 'Is Freelancer/Consultant',
                    initialValue: false,
                },
                {
                    name: 'isRemote',
                    type: 'boolean',
                    title: 'Works Fully Remote',
                    initialValue: false,
                },
                {
                    name: 'hasStartup',
                    type: 'boolean',
                    title: 'Runs a Startup',
                    initialValue: false,
                },
                {
                    name: 'isInMarketing',
                    type: 'boolean',
                    title: 'Works in Marketing',
                    initialValue: false,
                },
            ],
        }),

        defineField({
            name: 'technicalSkills',
            title: 'Technical Skills',
            type: 'object',
            fields: [
                {
                    name: 'knowsJavaScript',
                    type: 'boolean',
                    title: 'Knows JavaScript',
                    initialValue: false,
                },
                {
                    name: 'knowsPython',
                    type: 'boolean',
                    title: 'Knows Python',
                    initialValue: false,
                },
                {
                    name: 'knowsReact',
                    type: 'boolean',
                    title: 'Knows React',
                    initialValue: false,
                },
                {
                    name: 'knowsAI',
                    type: 'boolean',
                    title: 'Works with AI/ML',
                    initialValue: false,
                },
                {
                    name: 'knowsDesignTools',
                    type: 'boolean',
                    title: 'Uses Design Tools (Figma, etc)',
                    initialValue: false,
                },
                {
                    name: 'knowsDataAnalysis',
                    type: 'boolean',
                    title: 'Does Data Analysis',
                    initialValue: false,
                },
            ],
        }),

        defineField({
            name: 'personalTraits',
            title: 'Personal Traits',
            type: 'object',
            fields: [
                {
                    name: 'isMorningPerson',
                    type: 'boolean',
                    title: 'Morning Person',
                    initialValue: false,
                },
                {
                    name: 'prefersQuiet',
                    type: 'boolean',
                    title: 'Prefers Quiet Spaces',
                    initialValue: false,
                },
                {
                    name: 'attendsEvents',
                    type: 'boolean',
                    title: 'Regularly Attends Events',
                    initialValue: false,
                },
                {
                    name: 'likesCoffee',
                    type: 'boolean',
                    title: 'Coffee Enthusiast',
                    initialValue: false,
                },
                {
                    name: 'isVegetarian',
                    type: 'boolean',
                    title: 'Vegetarian/Vegan',
                    initialValue: false,
                },
                {
                    name: 'hasPets',
                    type: 'boolean',
                    title: 'Has Pets',
                    initialValue: false,
                },
                {
                    name: 'playsMusic',
                    type: 'boolean',
                    title: 'Plays Musical Instrument',
                    initialValue: false,
                },
                {
                    name: 'doesYoga',
                    type: 'boolean',
                    title: 'Practices Yoga/Meditation',
                    initialValue: false,
                },
            ],
        }),

        defineField({
            name: 'workStyle',
            title: 'Work Style',
            type: 'object',
            fields: [
                {
                    name: 'usesHotDesk',
                    type: 'boolean',
                    title: 'Usually at Hot Desk Area',
                    initialValue: false,
                },
                {
                    name: 'usesQuietZone',
                    type: 'boolean',
                    title: 'Usually in Quiet Zone',
                    initialValue: false,
                },
                {
                    name: 'usesMeetingRooms',
                    type: 'boolean',
                    title: 'Frequently Books Meeting Rooms',
                    initialValue: false,
                },
                {
                    name: 'worksWeekends',
                    type: 'boolean',
                    title: 'Sometimes Works Weekends',
                    initialValue: false,
                },
                {
                    name: 'takesCallsOften',
                    type: 'boolean',
                    title: 'Takes Many Phone/Video Calls',
                    initialValue: false,
                },
                {
                    name: 'wearsHeadphones',
                    type: 'boolean',
                    title: 'Usually Wears Headphones',
                    initialValue: false,
                },
            ],
        }),

        defineField({
            name: 'hobbies',
            title: 'Hobbies & Interests',
            type: 'object',
            fields: [
                {
                    name: 'playsVideoGames',
                    type: 'boolean',
                    title: 'Plays Video Games',
                    initialValue: false,
                },
                {
                    name: 'doesSports',
                    type: 'boolean',
                    title: 'Plays Sports Regularly',
                    initialValue: false,
                },
                {
                    name: 'likesHiking',
                    type: 'boolean',
                    title: 'Enjoys Hiking/Outdoors',
                    initialValue: false,
                },
                {
                    name: 'readsBooks',
                    type: 'boolean',
                    title: 'Avid Reader',
                    initialValue: false,
                },
                {
                    name: 'watchesAnime',
                    type: 'boolean',
                    title: 'Watches Anime/Manga Fan',
                    initialValue: false,
                },
                {
                    name: 'doesPhotography',
                    type: 'boolean',
                    title: 'Into Photography',
                    initialValue: false,
                },
                {
                    name: 'likesBoardGames',
                    type: 'boolean',
                    title: 'Enjoys Board Games',
                    initialValue: false,
                },
                {
                    name: 'doesArt',
                    type: 'boolean',
                    title: 'Creates Art/Crafts',
                    initialValue: false,
                },
            ],
        }),

        defineField({
            name: 'experience',
            title: 'Experience & Background',
            type: 'object',
            fields: [
                {
                    name: 'isNewMember',
                    type: 'boolean',
                    title: 'Joined Within Last 3 Months',
                    initialValue: false,
                },
                {
                    name: 'isVeteranMember',
                    type: 'boolean',
                    title: 'Member for Over 1 Year',
                    initialValue: false,
                },
                {
                    name: 'isUnder30',
                    type: 'boolean',
                    title: 'Under 30 Years Old',
                    initialValue: false,
                },
                {
                    name: 'hasKids',
                    type: 'boolean',
                    title: 'Has Children',
                    initialValue: false,
                },
                {
                    name: 'speaksMultipleLanguages',
                    type: 'boolean',
                    title: 'Speaks 3+ Languages',
                    initialValue: false,
                },
                {
                    name: 'hasLivedAbroad',
                    type: 'boolean',
                    title: 'Has Lived Abroad',
                    initialValue: false,
                },
            ],
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'profession',
            media: 'image',
        },
    },
});
