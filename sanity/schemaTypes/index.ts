import { type SchemaTypeDefinition } from 'sanity'
import member from './documents/member'
import questionCategory from './documents/questionCategory'
import game from './documents/game'
import gameMove from './objects/gameMove'
import question from './objects/question'
import gameInvitation from './documents/gameInvitation'


export const schema: { types: SchemaTypeDefinition[] } = {
  types: [member,questionCategory,game,gameMove,question,gameInvitation],
}
