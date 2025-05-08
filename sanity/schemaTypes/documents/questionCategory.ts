import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'questionCategory',
  title: 'Question Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Category Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'questions',
      title: 'Questions',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'question',
          fields: [
            {
              name: 'text',
              title: 'Question Text',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'attributePath',
              title: 'Member Attribute Path',
              type: 'string',
              description: 'The path to the attribute in the member object (e.g., "skills", "workspacePreferences.morningPerson")',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'attributeValue',
              title: 'Attribute Value',
              type: 'string',
              description: 'For arrays (like skills), the value to check. For booleans, leave empty as it will check if true.',
            },
            {
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
            }
          ],
          preview: {
            select: {
              title: 'text',
              subtitle: 'attributePath',
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
    },
  },
});