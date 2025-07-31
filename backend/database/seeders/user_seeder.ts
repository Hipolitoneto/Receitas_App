import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    // Criar usuário admin
    await User.create({
      fullName: 'Administrador',
      email: 'admin@receitas.com',
      password: 'admin123',
      userType: 'admin',
    })

    // Criar usuário comum
    await User.create({
      fullName: 'João Silva',
      email: 'joao@receitas.com',
      password: '12345678',
      userType: 'common',
    })

    // Criar mais alguns usuários para teste
    await User.create({
      fullName: 'Maria Santos',
      email: 'maria@receitas.com',
      password: '12345678',
      userType: 'common',
    })

    await User.create({
      fullName: 'Pedro Costa',
      email: 'pedro@receitas.com',
      password: '12345678',
      userType: 'common',
    })
  }
}