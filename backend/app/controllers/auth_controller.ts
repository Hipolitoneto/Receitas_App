import { HttpContext } from '@adonisjs/core/http'
import { schema, rules } from '@vinejs/vine'
import User from '#models/user'
import { logger } from '@adonisjs/core/logger'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    logger.info('🔐 [AUTH] Tentativa de registro iniciada')
    
    // Temporariamente sem validação para testar
    const data = await request.body()
    logger.info('📦 [AUTH] Dados de registro recebidos:', { email: data.email, fullName: data.fullName })

    const user = await User.create({
      ...data,
      userType: 'common', // Usuário padrão é comum
    })
    logger.info('✅ [AUTH] Usuário criado com sucesso:', { id: user.id, email: user.email })

    const token = await User.accessTokens.create(user)
    logger.info('🎫 [AUTH] Token de acesso criado para usuário:', { userId: user.id })

    logger.info('🎉 [AUTH] Registro concluído com sucesso')
    return response.created({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
        profilePhoto: user.profilePhoto,
      },
      token: token.value,
    })
  }

  async login({ request, response }: HttpContext) {
    logger.info('🔐 [AUTH] Tentativa de login iniciada')
    
    const { email, password } = await request.validateUsing(
      schema.create({
        email: schema.string({ trim: true }, [rules.email()]),
        password: schema.string(),
      })
    )
    logger.info('📧 [AUTH] Credenciais validadas para email:', email)

    const user = await User.verifyCredentials(email, password)
    logger.info('✅ [AUTH] Credenciais verificadas com sucesso para usuário:', { id: user.id, email: user.email })
    
    const token = await User.accessTokens.create(user)
    logger.info('🎫 [AUTH] Token de acesso criado para login:', { userId: user.id })

    logger.info('🎉 [AUTH] Login realizado com sucesso')
    return response.ok({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
        profilePhoto: user.profilePhoto,
      },
      token: token.value,
    })
  }

  async logout({ auth, response }: HttpContext) {
    logger.info('🚪 [AUTH] Tentativa de logout iniciada')
    
    const token = auth.use('api').token!
    const user = auth.use('api').user!
    logger.info('👤 [AUTH] Usuário fazendo logout:', { id: user.id, email: user.email })
    
    await User.accessTokens.delete(token)
    logger.info('🗑️ [AUTH] Token removido com sucesso')

    logger.info('👋 [AUTH] Logout realizado com sucesso')
    return response.noContent()
  }

  async me({ auth, response }: HttpContext) {
    logger.info('👤 [AUTH] Requisição para obter dados do usuário atual')
    
    const user = auth.use('api').user!
    logger.info('✅ [AUTH] Dados do usuário recuperados:', { id: user.id, email: user.email })
    
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
}