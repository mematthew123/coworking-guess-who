import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'question',
  title: 'Question',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      title: 'Question Text',
      type: 'string',
      description: 'The yes/no question displayed to players',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'attributePath',
      title: 'Member Attribute Path',
      type: 'string',
      description: 'The path to the attribute in the member document (e.g., "skills", "workspacePreferences.morningPerson")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'attributeValue',
      title: 'Attribute Value',
      type: 'string',
      description: 'For arrays (like skills), the value to check. For booleans, leave empty as it will check if true.',
    }),
    defineField({
      name: 'category',
      title: 'Question Category',
      type: 'string',
      options: {
        list: [
          { title: 'Professional', value: 'professional' },
          { title: 'Personal', value: 'personal' },
          { title: 'Workspace', value: 'workspace' },
          { title: 'Skills', value: 'skills' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty Level',
      type: 'number',
      description: 'A rating from 1 (easy) to 5 (hard) to indicate how specific the question is',
      options: {
        list: [
          { title: 'Very Easy', value: 1 },
          { title: 'Easy', value: 2 },
          { title: 'Medium', value: 3 },
          { title: 'Hard', value: 4 },
          { title: 'Very Hard', value: 5 },
        ],
      },
      initialValue: 3,
    }),
  ],
  preview: {
    select: {
      title: 'text',
      subtitle: 'category',
    },
  },
});