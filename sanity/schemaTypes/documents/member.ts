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
            readOnly:true
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
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'profession',
            media: 'image',
        },
    },
});
