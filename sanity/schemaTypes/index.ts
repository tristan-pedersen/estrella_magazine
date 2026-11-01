import {type SchemaTypeDefinition} from 'sanity'
import {articleType} from './articleType'
import {authorType} from './authorType'
import {categoryType} from './categoryType'

export const schema: {types: SchemaTypeDefinition[]} = {
  types: [articleType, authorType, categoryType],
}