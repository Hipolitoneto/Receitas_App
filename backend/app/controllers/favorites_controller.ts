import { HttpContext } from '@adonisjs/core/http'
import Favorite from '#models/favorite'
import Recipe from '#models/recipe'

export default class FavoritesController {
  async index({ auth, request, response }: HttpContext) {
    const user = auth.use('api').user!
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const favorites = await Favorite.query()
      .where('userId', user.id)
      .preload('recipe', (recipeQuery) => {
        recipeQuery.preload('user', (userQuery) => {
          userQuery.select('id', 'fullName', 'profilePhoto')
        })
      })
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return response.ok(favorites)
  }

  async store({ auth, params, response }: HttpContext) {
    const user = auth.use('api').user!
    const recipeId = params.recipeId

    // Verificar se a receita existe
    const recipe = await Recipe.findOrFail(recipeId)

    // Verificar se já é favorito
    const existingFavorite = await Favorite.query()
      .where('userId', user.id)
      .where('recipeId', recipeId)
      .first()

    if (existingFavorite) {
      return response.badRequest({
        message: 'Receita já está nos favoritos',
      })
    }

    const favorite = await Favorite.create({
      userId: user.id,
      recipeId: recipeId,
    })

    await favorite.load('recipe', (recipeQuery) => {
      recipeQuery.preload('user', (userQuery) => {
        userQuery.select('id', 'fullName', 'profilePhoto')
      })
    })

    return response.created(favorite)
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.use('api').user!
    const recipeId = params.recipeId

    const favorite = await Favorite.query()
      .where('userId', user.id)
      .where('recipeId', recipeId)
      .firstOrFail()

    await favorite.delete()

    return response.noContent()
  }

  async check({ auth, params, response }: HttpContext) {
    const user = auth.use('api').user!
    const recipeId = params.recipeId

    const favorite = await Favorite.query()
      .where('userId', user.id)
      .where('recipeId', recipeId)
      .first()

    return response.ok({
      isFavorite: !!favorite,
    })
  }
}