import { HttpContext } from '@adonisjs/core/http'
import { schema, rules } from '@vinejs/vine'
import User from '#models/user'
import { logger } from '@adonisjs/core/logger'

export default class UsersController {
  async show({ auth, response }: HttpContext) {
    logger.info('👤 [USERS] Visualização de perfil solicitada')
    
    const user = auth.use('api').user!
    logger.info('✅ [USERS] Dados do usuário recuperados:', { id: user.id, email: user.email })
    
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
    logger.info('✏️ [USERS] Atualização de perfil solicitada')
    
    const user = auth.use('api').user!
    logger.info('👤 [USERS] Usuário atualizando perfil:', { id: user.id, email: user.email })
    
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
    logger.info('✅ [USERS] Dados de atualização validados:', Object.keys(data))

    user.merge(data)
    await user.save()
    logger.info('✅ [USERS] Perfil atualizado com sucesso')

    logger.info('🎉 [USERS] Atualização de perfil concluída com sucesso')
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
    logger.info('🔐 [USERS] Atualização de senha solicitada')
    
    const user = auth.use('api').user!
    logger.info('👤 [USERS] Usuário alterando senha:', { id: user.id, email: user.email })
    
    const { currentPassword, newPassword } = await request.validateUsing(
      schema.create({
        currentPassword: schema.string(),
        newPassword: schema.string({}, [rules.minLength(8)]),
      })
    )
    logger.info('✅ [USERS] Dados de senha validados')

    // Verificar senha atual
    const isValidPassword = await user.verifyPassword(currentPassword)
    if (!isValidPassword) {
      logger.warn('⚠️ [USERS] Senha atual incorreta para usuário:', { id: user.id, email: user.email })
      return response.badRequest({
        message: 'Senha atual incorreta',
      })
    }
    logger.info('✅ [USERS] Senha atual verificada com sucesso')

    user.password = newPassword
    await user.save()
    logger.info('✅ [USERS] Senha atualizada com sucesso')

    logger.info('🎉 [USERS] Atualização de senha concluída com sucesso')
    return response.ok({
      message: 'Senha atualizada com sucesso',
    })
  }
}