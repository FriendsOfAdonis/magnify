import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { Searchable } from '../../src/mixins/searchable.js'
import { DateTime } from 'luxon'

export default class User extends compose(BaseModel, Searchable) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column({ serialize: (value) => (value === 1 ? true : false) })
  declare isAdmin: boolean

  @column.dateTime({ autoCreate: true, serialize: (value: DateTime) => value.toUnixInteger() })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static shouldBeSearchable = false

  shouldBeSearchable(): boolean {
    return User.shouldBeSearchable
  }
}
