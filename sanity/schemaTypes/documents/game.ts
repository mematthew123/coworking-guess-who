import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'game',
  title: 'Game',
  type: 'document',
  fields: [
    defineField({
      name: 'startedAt',
      title: 'Started At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endedAt',
      title: 'Ended At',
      type: 'datetime',
    }),
    defineField({
      name: 'status',
      title: 'Game Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Completed', value: 'completed' },
          { title: 'Abandoned', value: 'abandoned' },
        ],
      },
      initialValue: 'active',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'playerOne',
      title: 'Player One',
      type: 'reference',
      to: [{ type: 'member' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'playerTwo',
      title: 'Player Two',
      type: 'reference',
      to: [{ type: 'member' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'playerOneTarget',
      title: 'Player One Target',
      type: 'reference',
      to: [{ type: 'member' }],
      description: 'The member that Player Two is trying to guess',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'playerTwoTarget',
      title: 'Player Two Target',
      type: 'reference',
      to: [{ type: 'member' }],
      description: 'The member that Player One is trying to guess',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'boardMembers',
      title: 'Board Members',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'member' }],
        },
      ],
      validation: (Rule) => Rule.required().min(12).max(25),
    }),
    defineField({
      name: 'currentTurn',
      title: 'Current Turn',
      type: 'string',
      description: 'ID of the player whose turn it is',
    }),
    defineField({
      name: 'winner',
      title: 'Winner',
      type: 'string',
      description: 'ID of the winning player',
    }),
    defineField({
        name: 'moves',
        title: 'Game Moves',
        type: 'array',
        of: [{ type: 'gameMove' }],
      }),
      defineField({
        name: 'chat',
        title: 'Game Chat',
        type: 'array',
        of: [
          {
            type: 'object',
            name: 'chatMessage',
            fields: [
              {
                name: 'senderId',
                title: 'Sender ID',
                type: 'string',
              },
              {
                name: 'senderName',
                title: 'Sender Name',
                type: 'string',
              },
              {
                name: 'message',
                title: 'Message',
                type: 'text',
              },
              {
                name: 'timestamp',
                title: 'Timestamp',
                type: 'datetime',
              },
            ],
            preview: {
              select: {
                title: 'message',
                subtitle: 'senderName',
              },
            },
          },
        ],
      }),
    ],
  preview: {
    select: {
      playerOne: 'playerOne.name',
      playerTwo: 'playerTwo.name',
      status: 'status',
      startedAt: 'startedAt',
    },
    prepare({ playerOne, playerTwo, status, startedAt }) {
      return {
        title: `${playerOne || 'Unknown'} vs ${playerTwo || 'Unknown'}`,
        subtitle: `${status} - ${new Date(startedAt).toLocaleDateString()}`,
      };
    },
  },
});