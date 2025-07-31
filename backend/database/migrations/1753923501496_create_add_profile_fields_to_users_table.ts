import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('profile_photo').nullable()
      table.enum('user_type', ['common', 'admin']).defaultTo('common')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('profile_photo')
      table.dropColumn('user_type')
    })
  }
}