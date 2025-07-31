export interface User {
  id: number;
  fullName: string;
  email: string;
  userType: 'common' | 'admin';
  profilePhoto?: string;
  createdAt: string;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  cookingTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  image?: string;
  userId: number;
  user?: User;
  favorites?: Favorite[];
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: number;
  userId: number;
  recipeId: number;
  recipe?: Recipe;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface RecipeFormData {
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  cookingTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  image?: string;
}

export interface ProfileUpdateData {
  fullName?: string;
  email?: string;
  profilePhoto?: string;
}

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface SearchFilters {
  search?: string;
  category?: string;
  difficulty?: string;
  page?: number;
  limit?: number;
} 