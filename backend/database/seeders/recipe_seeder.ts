import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Recipe from '#models/recipe'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    // Buscar usuários para associar às receitas
    const users = await User.all()
    const joao = users.find(user => user.email === 'joao@receitas.com')
    const maria = users.find(user => user.email === 'maria@receitas.com')

    if (joao) {
      await Recipe.create({
        title: 'Bolo de Chocolate',
        description: 'Um delicioso bolo de chocolate caseiro, perfeito para sobremesas e comemorações.',
        ingredients: '2 xícaras de farinha de trigo\n1 xícara de açúcar\n1/2 xícara de cacau em pó\n1 colher de chá de fermento em pó\n1/2 colher de chá de sal\n2 ovos\n1 xícara de leite\n1/2 xícara de óleo\n1 colher de chá de baunilha',
        instructions: '1. Pré-aqueça o forno a 180°C\n2. Em uma tigela, misture a farinha, açúcar, cacau, fermento e sal\n3. Em outra tigela, bata os ovos, leite, óleo e baunilha\n4. Combine as misturas até ficar homogêneo\n5. Despeje em uma forma untada\n6. Asse por 30-35 minutos\n7. Deixe esfriar antes de desenformar',
        cookingTime: 35,
        servings: 8,
        difficulty: 'easy',
        category: 'Sobremesas',
        userId: joao.id,
      })

      await Recipe.create({
        title: 'Risoto de Frango',
        description: 'Um risoto cremoso e saboroso com frango e legumes.',
        ingredients: '1 xícara de arroz arbóreo\n300g de peito de frango\n1 cebola\n2 dentes de alho\n1/2 xícara de vinho branco\n4 xícaras de caldo de galinha\n1/2 xícara de queijo parmesão\n2 colheres de manteiga\nSal e pimenta a gosto',
        instructions: '1. Corte o frango em cubos e tempere\n2. Refogue o frango até dourar e reserve\n3. Refogue a cebola e alho na manteiga\n4. Adicione o arroz e mexa até ficar translúcido\n5. Adicione o vinho e mexa até evaporar\n6. Adicione o caldo aos poucos, mexendo sempre\n7. Quando o arroz estiver al dente, adicione o frango e parmesão\n8. Sirva quente',
        cookingTime: 45,
        servings: 4,
        difficulty: 'medium',
        category: 'Principais',
        userId: joao.id,
      })
    }

    if (maria) {
      await Recipe.create({
        title: 'Salada Caesar',
        description: 'Uma salada clássica e refrescante, perfeita para dias quentes.',
        ingredients: '1 alface romana\n1/2 xícara de croutons\n1/4 xícara de queijo parmesão ralado\n2 colheres de azeite\n1 colher de suco de limão\n1 dente de alho\nSal e pimenta a gosto',
        instructions: '1. Lave e corte a alface em pedaços\n2. Prepare o molho misturando azeite, limão, alho, sal e pimenta\n3. Misture a alface com o molho\n4. Adicione os croutons e parmesão\n5. Sirva imediatamente',
        cookingTime: 15,
        servings: 2,
        difficulty: 'easy',
        category: 'Saladas',
        userId: maria.id,
      })

      await Recipe.create({
        title: 'Sopa de Abóbora',
        description: 'Uma sopa cremosa e reconfortante, ideal para noites frias.',
        ingredients: '1 abóbora pequena\n1 cebola\n2 dentes de alho\n4 xícaras de caldo de legumes\n1/2 xícara de creme de leite\n2 colheres de manteiga\nSal e pimenta a gosto\nNoz-moscada a gosto',
        instructions: '1. Corte a abóbora em cubos\n2. Refogue a cebola e alho na manteiga\n3. Adicione a abóbora e refogue por 5 minutos\n4. Adicione o caldo e cozinhe até a abóbora ficar macia\n5. Bata no liquidificador até ficar cremoso\n6. Volte ao fogo, adicione o creme de leite e temperos\n7. Sirva quente',
        cookingTime: 40,
        servings: 6,
        difficulty: 'medium',
        category: 'Sopas',
        userId: maria.id,
      })
    }
  }
}