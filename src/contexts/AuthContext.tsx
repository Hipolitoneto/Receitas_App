import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';

interface User {
  id: string;
  email: string;
  fullName?: string;
  photoUri?: string;
  bio?: string;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Chaves para AsyncStorage
const USER_KEY = '@ReceitasApp:user';
const TOKEN_KEY = '@ReceitasApp:token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData(): Promise<void> {
    try {
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(TOKEN_KEY)
      ]);
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log('Erro ao carregar dados do storage:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentando fazer login com:', email);
      const response = await authService.login({ email, password });
      
      const userData = {
        id: response.user.id,
        email: response.user.email,
        fullName: response.user.fullName,
        photoUri: response.user.profilePhoto,
      };
      
      // Salvar token e dados do usuário
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, response.token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(userData))
      ]);
      
      setUser(userData);
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('📝 Tentando fazer registro com:', email);
      const response = await authService.register({ 
        fullName: email.split('@')[0], // Usar parte do email como nome
        email, 
        password 
      });
      
      const userData = {
        id: response.user.id,
        email: response.user.email,
        fullName: response.user.fullName,
        photoUri: response.user.profilePhoto,
      };
      
      // Salvar token e dados do usuário
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, response.token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(userData))
      ]);
      
      setUser(userData);
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.log('Erro ao fazer logout no servidor:', error);
    } finally {
      // Limpar dados locais mesmo se der erro no servidor
      await Promise.all([
        AsyncStorage.removeItem(USER_KEY),
        AsyncStorage.removeItem(TOKEN_KEY)
      ]);
      setUser(null);
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      if (!user) return;
      
      const updatedUser = { ...user, ...userData };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.log('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 