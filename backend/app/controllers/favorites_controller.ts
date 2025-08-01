import { HttpContext } from '@adonisjs/core/http'
import Favorite from '#models/favorite'
import Recipe from '#models/recipe'
import { logger } from '@adonisjs/core/logger'

export default class FavoritesController {
  async index({ auth, request, response }: HttpContext) {
    logger.info('❤️ [FAVORITES] Listagem de favoritos solicitada')
    
    const user = auth.use('api').user!
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    
    logger.info('👤 [FAVORITES] Usuário solicitando favoritos:', { userId: user.id, email: user.email, page, limit })

    const favorites = await Favorite.query()
      .where('userId', user.id)
      .preload('recipe', (recipeQuery) => {
        recipeQuery.preload('user', (userQuery) => {
          userQuery.select('id', 'fullName', 'profilePhoto')
        })
      })
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    logger.info('✅ [FAVORITES] Favoritos encontrados:', { total: favorites.total, currentPage: favorites.currentPage })
    return response.ok(favorites)
  }

  async store({ auth, params, response }: HttpContext) {
    logger.info('➕ [FAVORITES] Adição de favorito solicitada:', { recipeId: params.recipeId })
    
    const user = auth.use('api').user!
    const recipeId = params.recipeId
    logger.info('👤 [FAVORITES] Usuário adicionando favorito:', { userId: user.id, email: user.email })

    // Verificar se a receita existe
    const recipe = await Recipe.findOrFail(recipeId)
    logger.info('✅ [FAVORITES] Receita encontrada:', { id: recipe.id, title: recipe.title })

    // Verificar se já é favorito
    const existingFavorite = await Favorite.query()
      .where('userId', user.id)
      .where('recipeId', recipeId)
      .first()

    if (existingFavorite) {
      logger.warn('⚠️ [FAVORITES] Receita já está nos favoritos:', { recipeId, userId: user.id })
      return response.badRequest({
        message: 'Receita já está nos favoritos',
      })
    }

    const favorite = await Favorite.create({
      userId: user.id,
      recipeId: recipeId,
    })
    logger.info('✅ [FAVORITES] Favorito criado com sucesso:', { id: favorite.id, recipeId })

    await favorite.load('recipe', (recipeQuery) => {
      recipeQuery.preload('user', (userQuery) => {
        userQuery.select('id', 'fullName', 'profilePhoto')
      })
    })

    logger.info('🎉 [FAVORITES] Favorito adicionado e carregado com sucesso')
    return response.created(favorite)
  }

  async destroy({ auth, params, response }: HttpContext) {
    logger.info('🗑️ [FAVORITES] Remoção de favorito solicitada:', { recipeId: params.recipeId })
    
    const user = auth.use('api').user!
    const recipeId = params.recipeId
    logger.info('👤 [FAVORITES] Usuário removendo favorito:', { userId: user.id, email: user.email })

    const favorite = await Favorite.query()
      .where('userId', user.id)
      .where('recipeId', recipeId)
      .firstOrFail()
    logger.info('✅ [FAVORITES] Favorito encontrado para remoção:', { id: favorite.id, recipeId })

    await favorite.delete()
    logger.info('✅ [FAVORITES] Favorito removido com sucesso')

    logger.info('🎉 [FAVORITES] Remoção de favorito concluída com sucesso')
    return response.noContent()
  }

  async check({ auth, params, response }: HttpContext) {
    logger.info('🔍 [FAVORITES] Verificação de favorito solicitada:', { recipeId: params.recipeId })
    
    const user = auth.use('api').user!
    const recipeId = params.recipeId
    logger.info('👤 [FAVORITES] Usuário verificando favorito:', { userId: user.id, email: user.email })

    const favorite = await Favorite.query()
      .where('userId', user.id)
      .where('recipeId', recipeId)
      .first()

    const isFavorite = !!favorite
    logger.info('✅ [FAVORITES] Verificação concluída:', { recipeId, isFavorite })

    return response.ok({
      isFavorite: isFavorite,
    })
  }
}