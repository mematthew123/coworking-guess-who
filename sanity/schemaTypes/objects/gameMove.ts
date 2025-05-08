import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'gameMove',
  title: 'Game Move',
  type: 'object',
  fields: [
    defineField({
      name: 'playerId',
      title: 'Player ID',
      type: 'string',
      description: 'ID of the player who made this move',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'playerName',
      title: 'Player Name',
      type: 'string',
      description: 'Name of the player (stored for convenience)',
    }),
    defineField({
      name: 'questionText',
      title: 'Question Text',
      type: 'string',
      description: 'The text of the question that was asked',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'questionId',
      title: 'Question ID',
      type: 'string',
      description: 'Reference to the question that was asked (category ID + question index)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'boolean',
      description: 'Whether the answer to the question was Yes (true) or No (false)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'eliminatedCount',
      title: 'Eliminated Count',
      type: 'number',
      description: 'Number of members eliminated by this question',
    }),
  ],
  preview: {
    select: {
      title: 'questionText',
      subtitle: 'playerName',
      date: 'timestamp',
    },
    prepare({ title, subtitle, date }) {
      return {
        title: title || 'Unknown question',
        subtitle: `${subtitle || 'Player'} - ${date ? new Date(date).toLocaleString() : 'Unknown time'}`,
      };
    },
  },
});