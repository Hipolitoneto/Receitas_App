import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'
import { logger } from '@adonisjs/core/logger'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    logger.info('🔐 [AUTH_MIDDLEWARE] Verificando autenticação para rota:', { 
      url: ctx.request.url(), 
      method: ctx.request.method(),
      ip: ctx.request.ip()
    })
    
    await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })
    
    const user = ctx.auth.user
    if (user) {
      logger.info('✅ [AUTH_MIDDLEWARE] Usuário autenticado:', { id: user.id, email: user.email })
    }
    
    return next()
  }
}