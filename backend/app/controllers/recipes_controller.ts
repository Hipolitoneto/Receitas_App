import { HttpContext } from '@adonisjs/core/http'
import { schema, rules } from '@vinejs/vine'
import Recipe from '#models/recipe'
import db from '@adonisjs/lucid/services/db'
import { logger } from '@adonisjs/core/logger'

export default class RecipesController {
  async index({ request, response }: HttpContext) {
    logger.info('🍳 [RECIPES] Listagem de receitas solicitada')
    
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const search = request.input('search', '')
    const category = request.input('category', '')
    const difficulty = request.input('difficulty', '')
    
    logger.info('🔍 [RECIPES] Filtros aplicados:', { page, limit, search, category, difficulty })

    const query = Recipe.query()
      .preload('user', (userQuery) => {
        userQuery.select('id', 'fullName', 'profilePhoto')
      })
      .preload('favorites')

    // Busca por título ou descrição
    if (search) {
      query.where((subQuery) => {
        subQuery
          .whereILike('title', `%${search}%`)
          .orWhereILike('description', `%${search}%`)
          .orWhereILike('ingredients', `%${search}%`)
      })
      logger.info('🔎 [RECIPES] Busca aplicada:', search)
    }

    // Filtro por categoria
    if (category) {
      query.where('category', category)
      logger.info('🏷️ [RECIPES] Filtro por categoria:', category)
    }

    // Filtro por dificuldade
    if (difficulty) {
      query.where('difficulty', difficulty)
      logger.info('⭐ [RECIPES] Filtro por dificuldade:', difficulty)
    }

    const recipes = await query
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    logger.info('✅ [RECIPES] Receitas encontradas:', { total: recipes.total, currentPage: recipes.currentPage })
    return response.ok(recipes)
  }

  async show({ params, response }: HttpContext) {
    logger.info('👁️ [RECIPES] Visualização de receita solicitada:', { recipeId: params.id })
    
    const recipe = await Recipe.query()
      .where('id', params.id)
      .preload('user', (userQuery) => {
        userQuery.select('id', 'fullName', 'profilePhoto')
      })
      .preload('favorites')
      .firstOrFail()

    logger.info('✅ [RECIPES] Receita encontrada:', { id: recipe.id, title: recipe.title })
    return response.ok(recipe)
  }

  async store({ auth, request, response }: HttpContext) {
    logger.info('➕ [RECIPES] Criação de nova receita solicitada')
    
    const user = auth.use('api').user!
    logger.info('👤 [RECIPES] Usuário criando receita:', { userId: user.id, email: user.email })
    
    const data = await request.validateUsing(
      schema.create({
        title: schema.string({ trim: true }, [rules.minLength(3)]),
        description: schema.string({ trim: true }, [rules.minLength(10)]),
        ingredients: schema.string({ trim: true }, [rules.minLength(10)]),
        instructions: schema.string({ trim: true }, [rules.minLength(20)]),
        cookingTime: schema.number([rules.range(1, 1000)]),
        servings: schema.number([rules.range(1, 50)]),
        difficulty: schema.enum(['easy', 'medium', 'hard']),
        category: schema.string({ trim: true }, [rules.minLength(2)]),
        image: schema.string().optional(),
      })
    )
    logger.info('✅ [RECIPES] Dados da receita validados:', { title: data.title, category: data.category })

    const recipe = await Recipe.create({
      ...data,
      userId: user.id,
    })
    logger.info('✅ [RECIPES] Receita criada com sucesso:', { id: recipe.id, title: recipe.title })

    await recipe.load('user', (userQuery) => {
      userQuery.select('id', 'fullName', 'profilePhoto')
    })

    logger.info('🎉 [RECIPES] Receita criada e carregada com sucesso')
    return response.created(recipe)
  }

  async update({ auth, params, request, response }: HttpContext) {
    logger.info('✏️ [RECIPES] Atualização de receita solicitada:', { recipeId: params.id })
    
    const user = auth.use('api').user!
    logger.info('👤 [RECIPES] Usuário atualizando receita:', { userId: user.id, email: user.email })
    
    const recipe = await Recipe.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()
    logger.info('✅ [RECIPES] Receita encontrada para atualização:', { id: recipe.id, title: recipe.title })

    const data = await request.validateUsing(
      schema.create({
        title: schema.string({ trim: true }, [rules.minLength(3)]).optional(),
        description: schema.string({ trim: true }, [rules.minLength(10)]).optional(),
        ingredients: schema.string({ trim: true }, [rules.minLength(10)]).optional(),
        instructions: schema.string({ trim: true }, [rules.minLength(20)]).optional(),
        cookingTime: schema.number([rules.range(1, 1000)]).optional(),
        servings: schema.number([rules.range(1, 50)]).optional(),
        difficulty: schema.enum(['easy', 'medium', 'hard']).optional(),
        category: schema.string({ trim: true }, [rules.minLength(2)]).optional(),
        image: schema.string().optional(),
      })
    )
    logger.info('✅ [RECIPES] Dados de atualização validados:', Object.keys(data))

    recipe.merge(data)
    await recipe.save()
    logger.info('✅ [RECIPES] Receita atualizada com sucesso')

    await recipe.load('user', (userQuery) => {
      userQuery.select('id', 'fullName', 'profilePhoto')
    })

    logger.info('🎉 [RECIPES] Receita atualizada e carregada com sucesso')
    return response.ok(recipe)
  }

  async destroy({ auth, params, response }: HttpContext) {
    logger.info('🗑️ [RECIPES] Exclusão de receita solicitada:', { recipeId: params.id })
    
    const user = auth.use('api').user!
    logger.info('👤 [RECIPES] Usuário excluindo receita:', { userId: user.id, email: user.email })
    
    const recipe = await Recipe.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()
    logger.info('✅ [RECIPES] Receita encontrada para exclusão:', { id: recipe.id, title: recipe.title })

    await recipe.delete()
    logger.info('✅ [RECIPES] Receita excluída com sucesso')

    logger.info('🎉 [RECIPES] Exclusão concluída com sucesso')
    return response.noContent()
  }

  async myRecipes({ auth, request, response }: HttpContext) {
    logger.info('👤 [RECIPES] Listagem de minhas receitas solicitada')
    
    const user = auth.use('api').user!
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    
    logger.info('👤 [RECIPES] Usuário solicitando suas receitas:', { userId: user.id, email: user.email, page, limit })

    const recipes = await Recipe.query()
      .where('userId', user.id)
      .preload('favorites')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    logger.info('✅ [RECIPES] Receitas do usuário encontradas:', { total: recipes.total, currentPage: recipes.currentPage })
    return response.ok(recipes)
  }

  async categories({ response }: HttpContext) {
    logger.info('🏷️ [RECIPES] Listagem de categorias solicitada')

    const categories = await db
      .from('recipes')
      .select('category')
      .distinct()
      .orderBy('category')

    logger.info('✅ [RECIPES] Categorias encontradas:', { count: categories.length, categories: categories.map(cat => cat.category) })
    return response.ok({
      categories: categories.map((cat) => cat.category),
    })
  }
}