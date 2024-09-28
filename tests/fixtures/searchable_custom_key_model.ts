import { column } from '@adonisjs/lucid/orm'
import stringHelpers from '@adonisjs/core/helpers/string'
import { SearchableModel } from './searchable_model.js'

export class SearchableCustomKeyModel extends SearchableModel {
  @column({ isPrimary: true })
  id: string = stringHelpers.random(10)

  constructor(id?: string) {
    super()
    if (id) this.id = id
  }

  static get $searchKey(): string {
    return 'custom-key'
  }

  get $searchKeyValue(): string | number {
    return `custom-key.${this.id}`
  }
}
