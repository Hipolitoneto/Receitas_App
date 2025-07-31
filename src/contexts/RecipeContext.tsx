import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { recipeService, favoriteService } from '../services/api';
import { useAuth } from './AuthContext';

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  imageUri?: string;
  prepTime: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  servings: number;
  createdAt: string;
  userId: string;
  isFavorite?: boolean;
}

interface RecipeContextData {
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => Promise<void>;
  getRecipesByUser: (userId: string) => Recipe[];
  toggleFavorite: (recipeId: string) => Promise<void>;
  getFavoriteRecipes: (userId: string) => Recipe[];
  isLoading: boolean;
  loadRecipes: () => Promise<void>;
}

const RecipeContext = createContext<RecipeContextData>({} as RecipeContextData);

const RECIPES_KEY = '@ReceitasApp:recipes';

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadRecipes();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadRecipes = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await recipeService.getRecipes();
      
      // Converter dados da API para o formato local
      const convertedRecipes: Recipe[] = response.data.map((apiRecipe: any) => ({
        id: apiRecipe.id.toString(),
        name: apiRecipe.title,
        ingredients: apiRecipe.ingredients.split('\n').filter((i: string) => i.trim()),
        instructions: apiRecipe.instructions.split('\n').filter((i: string) => i.trim()),
        imageUri: apiRecipe.image,
        prepTime: `${apiRecipe.cookingTime} min`,
        difficulty: apiRecipe.difficulty === 'easy' ? 'Fácil' : 
                   apiRecipe.difficulty === 'medium' ? 'Médio' : 'Difícil',
        servings: apiRecipe.servings,
        createdAt: apiRecipe.createdAt,
        userId: apiRecipe.userId,
        isFavorite: apiRecipe.favorites && apiRecipe.favorites.length > 0,
      }));
      
      setRecipes(convertedRecipes);
      
      // Salvar no AsyncStorage como cache
      await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(convertedRecipes));
    } catch (error) {
      console.log('Erro ao carregar receitas da API:', error);
      
      // Se der erro na API, carregar do cache local
      try {
        const storedRecipes = await AsyncStorage.getItem(RECIPES_KEY);
        if (storedRecipes) {
          setRecipes(JSON.parse(storedRecipes));
        }
      } catch (cacheError) {
        console.log('Erro ao carregar cache local:', cacheError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      // Converter para formato da API
      const apiRecipeData = {
        title: recipeData.name,
        description: recipeData.ingredients.join('\n'), // Usar ingredientes como descrição
        ingredients: recipeData.ingredients.join('\n'),
        instructions: recipeData.instructions.join('\n'),
        cookingTime: parseInt(recipeData.prepTime.replace(/\D/g, '')),
        servings: recipeData.servings,
        difficulty: recipeData.difficulty === 'Fácil' ? 'easy' : 
                   recipeData.difficulty === 'Médio' ? 'medium' : 'hard',
        category: 'Geral', // Categoria padrão
      };

      const newApiRecipe = await recipeService.createRecipe(apiRecipeData);
      
      // Converter resposta da API para formato local
      const newRecipe: Recipe = {
        id: newApiRecipe.id.toString(),
        name: newApiRecipe.title,
        ingredients: newApiRecipe.ingredients.split('\n').filter(i => i.trim()),
        instructions: newApiRecipe.instructions.split('\n').filter(i => i.trim()),
        imageUri: newApiRecipe.image,
        prepTime: `${newApiRecipe.cookingTime} min`,
        difficulty: newApiRecipe.difficulty === 'easy' ? 'Fácil' : 
                   newApiRecipe.difficulty === 'medium' ? 'Médio' : 'Difícil',
        servings: newApiRecipe.servings,
        createdAt: newApiRecipe.createdAt,
        userId: newApiRecipe.userId,
        isFavorite: false,
      };

      const updatedRecipes = [...recipes, newRecipe];
      setRecipes(updatedRecipes);
      await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipes));
    } catch (error) {
      console.log('Erro ao criar receita:', error);
      throw error;
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      await recipeService.deleteRecipe(parseInt(id));
      const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
      setRecipes(updatedRecipes);
      await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipes));
    } catch (error) {
      console.log('Erro ao deletar receita:', error);
      throw error;
    }
  };

  const updateRecipe = async (id: string, recipeData: Partial<Recipe>) => {
    try {
      // Converter para formato da API
      const apiRecipeData: any = {};
      if (recipeData.name) apiRecipeData.title = recipeData.name;
      if (recipeData.ingredients) apiRecipeData.ingredients = recipeData.ingredients.join('\n');
      if (recipeData.instructions) apiRecipeData.instructions = recipeData.instructions.join('\n');
      if (recipeData.prepTime) apiRecipeData.cookingTime = parseInt(recipeData.prepTime.replace(/\D/g, ''));
      if (recipeData.servings) apiRecipeData.servings = recipeData.servings;
      if (recipeData.difficulty) {
        apiRecipeData.difficulty = recipeData.difficulty === 'Fácil' ? 'easy' : 
                                  recipeData.difficulty === 'Médio' ? 'medium' : 'hard';
      }

      await recipeService.updateRecipe(parseInt(id), apiRecipeData);
      
      const updatedRecipes = recipes.map(recipe => 
        recipe.id === id ? { ...recipe, ...recipeData } : recipe
      );
      setRecipes(updatedRecipes);
      await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipes));
    } catch (error) {
      console.log('Erro ao atualizar receita:', error);
      throw error;
    }
  };

  const getRecipesByUser = (userId: string) => {
    return recipes.filter(recipe => recipe.userId === userId);
  };

  const toggleFavorite = async (recipeId: string) => {
    try {
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) return;

      if (recipe.isFavorite) {
        await favoriteService.removeFavorite(parseInt(recipeId));
      } else {
        await favoriteService.addFavorite(parseInt(recipeId));
      }

      const updatedRecipes = recipes.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, isFavorite: !recipe.isFavorite }
          : recipe
      );
      
      setRecipes(updatedRecipes);
      await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipes));
    } catch (error) {
      console.log('Erro ao alternar favorito:', error);
      throw error;
    }
  };

  const getFavoriteRecipes = (userId: string) => {
    const favorites = recipes.filter(recipe => recipe.userId === userId && recipe.isFavorite);
    return favorites;
  };

  return (
    <RecipeContext.Provider value={{
      recipes,
      addRecipe,
      deleteRecipe,
      updateRecipe,
      getRecipesByUser,
      toggleFavorite,
      getFavoriteRecipes,
      isLoading,
      loadRecipes,
    }}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipe(): RecipeContextData {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipe deve ser usado dentro de um RecipeProvider');
  }
  return context;
} 