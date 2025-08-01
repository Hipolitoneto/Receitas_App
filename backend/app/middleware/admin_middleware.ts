import type { HttpContext } from '@adonisjs/core/http'
import { logger } from '@adonisjs/core/logger'

export default class AdminMiddleware {
  async handle({ auth, response }: HttpContext, next: () => Promise<void>) {
    const user = auth.use('api').user!
    
    logger.info('👑 [ADMIN_MIDDLEWARE] Verificando permissões de admin para usuário:', { 
      id: user.id, 
      email: user.email, 
      userType: user.userType 
    })
    
    if (user.userType !== 'admin') {
      logger.warn('🚫 [ADMIN_MIDDLEWARE] Acesso negado - usuário não é admin:', { 
        id: user.id, 
        email: user.email, 
        userType: user.userType 
      })
      return response.forbidden({
        message: 'Acesso negado. Apenas administradores podem acessar este recurso.',
      })
    }

    logger.info('✅ [ADMIN_MIDDLEWARE] Acesso de admin permitido')
    await next()
  }
}