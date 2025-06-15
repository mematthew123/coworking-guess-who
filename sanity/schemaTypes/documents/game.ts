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
          name: 'userId',
          title: 'User ID',
          type: 'string',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'userName',
          title: 'User Name',
          type: 'string',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'content',
          title: 'Message Content',
          type: 'array',
          of: [
            {
              type: 'block',
              styles: [
                { title: 'Normal', value: 'normal' }
              ],
              marks: {
                decorators: [
                  { title: 'Strong', value: 'strong' },
                  { title: 'Emphasis', value: 'em' }
                ],
                annotations: []
              }
            }
          ],
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'timestamp',
          title: 'Timestamp',
          type: 'datetime',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'gameEvent',
          title: 'Game Event',
          type: 'object',
          fields: [
            {
              name: 'type',
              title: 'Event Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Question', value: 'question' },
                  { title: 'Answer', value: 'answer' },
                  { title: 'Guess', value: 'guess' },
                  { title: 'Elimination', value: 'elimination' },
                  { title: 'Game Start', value: 'game_start' },
                  { title: 'Game End', value: 'game_end' }
                ]
              }
            },
            {
              name: 'details',
              title: 'Event Details',
              type: 'string'
            }
          ]
        }
      ],
      preview: {
        select: {
          userName: 'userName',
          timestamp: 'timestamp',
          text: 'content[0].children[0].text'
        },
        prepare({ userName, timestamp, text }) {
          return {
            title: `${userName}: ${text || 'Message'}`,
            subtitle: timestamp ? new Date(timestamp).toLocaleString() : ''
          };
        }
      }
    }
  ]
  }),
  ],
  preview: {
    select: {
      playerOne: 'playerOne.name',
      playerTwo: 'playerTwo.name',
      status: 'status',
      startedAt: 'startedAt',
      endedAt: 'endedAt',
    },
    prepare({ playerOne, playerTwo, status, startedAt, endedAt }) {
      return {    
        title: `Game: ${playerOne} vs ${playerTwo}`,
        subtitle: `Status: ${status} | Started: ${new Date(startedAt).toLocaleString()}${endedAt ? ` | Ended: ${new Date(endedAt).toLocaleString()}` : ''}`,
      };
    },
  }
});