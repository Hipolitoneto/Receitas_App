import type { HttpContext } from '@adonisjs/core/http'

export default class AdminMiddleware {
  async handle({ auth, response }: HttpContext, next: () => Promise<void>) {
    const user = auth.use('api').user!
    
    if (user.userType !== 'admin') {
      return response.forbidden({
        message: 'Acesso negado. Apenas administradores podem acessar este recurso.',
      })
    }

    await next()
  }
}