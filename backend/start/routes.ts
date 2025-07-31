/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Rotas públicas
router.group(() => {
  // Autenticação
  router.post('/register', '#controllers/auth_controller.register')
  router.post('/login', '#controllers/auth_controller.login')
  
  // Receitas públicas
  router.get('/recipes', '#controllers/recipes_controller.index')
  router.get('/recipes/:id', '#controllers/recipes_controller.show')
  router.get('/recipes/categories', '#controllers/recipes_controller.categories')
}).prefix('/api/v1')

// Rotas protegidas
router.group(() => {
  // Autenticação
  router.post('/logout', '#controllers/auth_controller.logout')
  router.get('/me', '#controllers/auth_controller.me')
  
  // Usuários
  router.get('/profile', '#controllers/users_controller.show')
  router.put('/profile', '#controllers/users_controller.update')
  router.put('/profile/password', '#controllers/users_controller.updatePassword')
  
  // Receitas
  router.post('/recipes', '#controllers/recipes_controller.store')
  router.put('/recipes/:id', '#controllers/recipes_controller.update')
  router.delete('/recipes/:id', '#controllers/recipes_controller.destroy')
  router.get('/my-recipes', '#controllers/recipes_controller.myRecipes')
  
  // Favoritos
  router.get('/favorites', '#controllers/favorites_controller.index')
  router.post('/favorites/:recipeId', '#controllers/favorites_controller.store')
  router.delete('/favorites/:recipeId', '#controllers/favorites_controller.destroy')
  router.get('/favorites/:recipeId/check', '#controllers/favorites_controller.check')
  
}).prefix('/api/v1').use(middleware.auth({ guards: ['api'] }))

// Rota de teste (pública)
router.get('/', async () => {
  return {
    message: 'API de Receitas Pessoais',
    version: '1.0.0',
    status: 'online',
  }
})
