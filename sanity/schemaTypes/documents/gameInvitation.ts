import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'gameInvitation',
  title: 'Game Invitation',
  type: 'document',
  fields: [
    defineField({
      name: 'from',
      title: 'From',
      type: 'reference',
      to: [{ type: 'member' }],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'to',
      title: 'To',
      type: 'reference',
      to: [{ type: 'member' }],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Accepted', value: 'accepted' },
          { title: 'Declined', value: 'declined' },
          { title: 'Expired', value: 'expired' },
          { title: 'Completed', value: 'completed' } // When game is created
        ],
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires At',
      type: 'datetime',
    }),
    defineField({
      name: 'gameId',
      title: 'Game ID',
      type: 'string',
      description: 'ID of the game created after invitation is accepted',
    }),
    defineField({
      name: 'fromCharacterId',
      title: 'From Character ID',
      type: 'string',
      description: 'ID of the character selected by the inviter',
    }),
    defineField({
      name: 'toCharacterId',
      title: 'To Character ID',
      type: 'string',
      description: 'ID of the character selected by the invited player',
    }),
  ],
  preview: {
    select: {
      fromName: 'from.name',
      toName: 'to.name',
      status: 'status',
      createdAt: 'createdAt'
    },
    prepare({ fromName, toName, status, createdAt }) {
      return {
        title: `${fromName || 'Unknown'} → ${toName || 'Unknown'}`,
        subtitle: `${status} - ${new Date(createdAt).toLocaleDateString()}`
      };
    }
  }
});