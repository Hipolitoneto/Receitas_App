import { HttpContext } from '@adonisjs/core/http'
import { schema, rules } from '@vinejs/vine'
import User from '#models/user'

export default class UsersController {
  async show({ auth, response }: HttpContext) {
    const user = auth.use('api').user!
    
    return response.ok({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
        profilePhoto: user.profilePhoto,
        createdAt: user.createdAt,
      },
    })
  }

  async update({ auth, request, response }: HttpContext) {
    const user = auth.use('api').user!
    
    const data = await request.validateUsing(
      schema.create({
        fullName: schema.string({ trim: true }, [rules.minLength(2)]).optional(),
        email: schema.string({ trim: true }, [
          rules.email(),
          rules.unique({ table: 'users', column: 'email', where: { id: user.id } }),
        ]).optional(),
        profilePhoto: schema.string().optional(),
      })
    )

    user.merge(data)
    await user.save()

    return response.ok({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
        profilePhoto: user.profilePhoto,
      },
    })
  }

  async updatePassword({ auth, request, response }: HttpContext) {
    const user = auth.use('api').user!
    
    const { currentPassword, newPassword } = await request.validateUsing(
      schema.create({
        currentPassword: schema.string(),
        newPassword: schema.string({}, [rules.minLength(8)]),
      })
    )

    // Verificar senha atual
    const isValidPassword = await user.verifyPassword(currentPassword)
    if (!isValidPassword) {
      return response.badRequest({
        message: 'Senha atual incorreta',
      })
    }

    user.password = newPassword
    await user.save()

    return response.ok({
      message: 'Senha atualizada com sucesso',
    })
  }
}