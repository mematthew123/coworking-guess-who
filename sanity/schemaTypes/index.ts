import { type SchemaTypeDefinition } from 'sanity'
import member from './documents/member'
import questionCategory from './documents/questionCategory'
import game from './documents/game'


export const schema: { types: SchemaTypeDefinition[] } = {
  types: [member,questionCategory,game],
}
