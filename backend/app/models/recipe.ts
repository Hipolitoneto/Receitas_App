import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Favorite from './favorite.js'

export default class Recipe extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare ingredients: string

  @column()
  declare instructions: string

  @column()
  declare cookingTime: number // em minutos

  @column()
  declare servings: number

  @column()
  declare difficulty: 'easy' | 'medium' | 'hard'

  @column()
  declare category: string

  @column()
  declare image: string | null

  @column()
  declare userId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Favorite)
  declare favorites: HasMany<typeof Favorite>
}