import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, Recipe, User, Favorite, RecipeFormData, ProfileUpdateData, PasswordUpdateData, SearchFilters, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:3333/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@ReceitasApp:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('@ReceitasApp:token');
      await AsyncStorage.removeItem('@ReceitasApp:user');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Registro
  register: async (data: { fullName: string; email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post('/register', data);
    return response.data;
  },

  // Login
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post('/login', data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/logout');
  },

  // Obter dados do usuário logado
  me: async (): Promise<{ user: User }> => {
    const response = await api.get('/me');
    return response.data;
  },
};

export const userService = {
  // Obter perfil
  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/profile');
    return response.data;
  },

  // Atualizar perfil
  updateProfile: async (data: ProfileUpdateData): Promise<{ user: User }> => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  // Atualizar senha
  updatePassword: async (data: PasswordUpdateData): Promise<{ message: string }> => {
    const response = await api.put('/profile/password', data);
    return response.data;
  },
};

export const recipeService = {
  // Listar receitas
  getRecipes: async (filters?: SearchFilters): Promise<ApiResponse<Recipe[]>> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/recipes?${params.toString()}`);
    return response.data;
  },

  // Obter receita específica
  getRecipe: async (id: number): Promise<Recipe> => {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
  },

  // Criar receita
  createRecipe: async (data: RecipeFormData): Promise<Recipe> => {
    const response = await api.post('/recipes', data);
    return response.data;
  },

  // Atualizar receita
  updateRecipe: async (id: number, data: Partial<RecipeFormData>): Promise<Recipe> => {
    const response = await api.put(`/recipes/${id}`, data);
    return response.data;
  },

  // Deletar receita
  deleteRecipe: async (id: number): Promise<void> => {
    await api.delete(`/recipes/${id}`);
  },

  // Minhas receitas
  getMyRecipes: async (page?: number, limit?: number): Promise<ApiResponse<Recipe[]>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const response = await api.get(`/my-recipes?${params.toString()}`);
    return response.data;
  },

  // Categorias
  getCategories: async (): Promise<{ categories: string[] }> => {
    const response = await api.get('/recipes/categories');
    return response.data;
  },
};

export const favoriteService = {
  // Listar favoritos
  getFavorites: async (page?: number, limit?: number): Promise<ApiResponse<Favorite[]>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const response = await api.get(`/favorites?${params.toString()}`);
    return response.data;
  },

  // Adicionar aos favoritos
  addFavorite: async (recipeId: number): Promise<Favorite> => {
    const response = await api.post(`/favorites/${recipeId}`);
    return response.data;
  },

  // Remover dos favoritos
  removeFavorite: async (recipeId: number): Promise<void> => {
    await api.delete(`/favorites/${recipeId}`);
  },

  // Verificar se é favorito
  checkFavorite: async (recipeId: number): Promise<{ isFavorite: boolean }> => {
    const response = await api.get(`/favorites/${recipeId}/check`);
    return response.data;
  },
};

export default api; 