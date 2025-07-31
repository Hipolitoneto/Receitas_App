import { HttpContext } from '@adonisjs/core/http'
import { schema, rules } from '@vinejs/vine'
import Recipe from '#models/recipe'
import db from '@adonisjs/lucid/services/db'

export default class RecipesController {
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const search = request.input('search', '')
    const category = request.input('category', '')
    const difficulty = request.input('difficulty', '')

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
    }

    // Filtro por categoria
    if (category) {
      query.where('category', category)
    }

    // Filtro por dificuldade
    if (difficulty) {
      query.where('difficulty', difficulty)
    }

    const recipes = await query
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return response.ok(recipes)
  }

  async show({ params, response }: HttpContext) {
    const recipe = await Recipe.query()
      .where('id', params.id)
      .preload('user', (userQuery) => {
        userQuery.select('id', 'fullName', 'profilePhoto')
      })
      .preload('favorites')
      .firstOrFail()

    return response.ok(recipe)
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.use('api').user!
    
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

    const recipe = await Recipe.create({
      ...data,
      userId: user.id,
    })

    await recipe.load('user', (userQuery) => {
      userQuery.select('id', 'fullName', 'profilePhoto')
    })

    return response.created(recipe)
  }

  async update({ auth, params, request, response }: HttpContext) {
    const user = auth.use('api').user!
    
    const recipe = await Recipe.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

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

    recipe.merge(data)
    await recipe.save()

    await recipe.load('user', (userQuery) => {
      userQuery.select('id', 'fullName', 'profilePhoto')
    })

    return response.ok(recipe)
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.use('api').user!
    
    const recipe = await Recipe.query()
      .where('id', params.id)
      .where('userId', user.id)
      .firstOrFail()

    await recipe.delete()

    return response.noContent()
  }

  async myRecipes({ auth, request, response }: HttpContext) {
    const user = auth.use('api').user!
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const recipes = await Recipe.query()
      .where('userId', user.id)
      .preload('favorites')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return response.ok(recipes)
  }

  async categories({ response }: HttpContext) {
    const categories = await db
      .from('recipes')
      .select('category')
      .distinct()
      .orderBy('category')

    return response.ok({
      categories: categories.map((cat) => cat.category),
    })
  }
}