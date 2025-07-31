import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'recipes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.text('description').notNullable()
      table.text('ingredients').notNullable()
      table.text('instructions').notNullable()
      table.integer('cooking_time').notNullable() // em minutos
      table.integer('servings').notNullable()
      table.enum('difficulty', ['easy', 'medium', 'hard']).notNullable()
      table.string('category').notNullable()
      table.string('image').nullable()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}