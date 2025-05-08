// src/structure.ts
import type { StructureResolver } from 'sanity/structure'
import { UserIcon, UsersIcon, ControlsIcon, HelpCircleIcon } from '@sanity/icons'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Coworking Guess Who')
    .items([
      // Game Management Section
      S.listItem()
        .title('Game Management')
        .icon(ControlsIcon)
        .child(
          S.list()
            .title('Game Management')
            .items([
              S.documentTypeListItem('game')
                .title('Games')
                .icon(ControlsIcon),
            ])
        ),

      // Member Management Section
      S.listItem()
        .title('Members')
        .icon(UsersIcon)
        .child(
          S.list()
            .title('Members')
            .items([
              S.documentTypeListItem('member')
                .title('Coworking Members')
                .icon(UserIcon),
            ])
        ),

      // Question Management Section  
      S.listItem()
        .title('Question Management')
        .icon(HelpCircleIcon)
        .child(
          S.list()
            .title('Question Management')
            .items([
              S.documentTypeListItem('questionCategory')
                .title('Question Categories'),
            ])
        ),

      S.divider(),

      // Display all other document types not specifically handled above
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['game', 'member', 'questionCategory'].includes(item.getId()!),
      ),
    ])