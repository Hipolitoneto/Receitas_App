import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    // Temporariamente sem validação para testar
    const data = await request.body()

    const user = await User.create({
      ...data,
      userType: 'common', // Usuário padrão é comum
    })

    const token = await User.accessTokens.create(user)

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
    const { email, password } = await request.validateUsing(
      schema.create({
        email: schema.string({ trim: true }, [rules.email()]),
        password: schema.string(),
      })
    )

    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)

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
    const token = auth.use('api').token!
    await User.accessTokens.delete(token)

    return response.noContent()
  }

  async me({ auth, response }: HttpContext) {
    const user = auth.use('api').user!
    
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