import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { recipeService, favoriteService } from '../services/api';
import { Recipe } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface RecipeDetailScreenProps {
  navigation: any;
  route: any;
}

const { width } = Dimensions.get('window');

export const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { recipeId } = route.params;
  const { user } = useAuth();
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadRecipe();
    checkFavoriteStatus();
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      const data = await recipeService.getRecipe(recipeId);
      setRecipe(data);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar receita');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoriteService.checkFavorite(recipeId);
      setIsFavorite(response.isFavorite);
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(recipeId);
        setIsFavorite(false);
      } else {
        await favoriteService.addFavorite(recipeId);
        setIsFavorite(true);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar favoritos');
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditRecipe', { recipeId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta receita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await recipeService.deleteRecipe(recipeId);
              Alert.alert('Sucesso', 'Receita excluída com sucesso');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Erro ao excluir receita');
            }
          },
        },
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'hard':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Médio';
      case 'hard':
        return 'Difícil';
      default:
        return difficulty;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando receita...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Receita não encontrada</Text>
      </View>
    );
  }

  const isOwner = user?.id === recipe.userId;

  return (
    <ScrollView style={styles.container}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        {recipe.image ? (
          <Image source={{ uri: recipe.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📷</Text>
          </View>
        )}
        
        {/* Favorite Button */}
        <TouchableOpacity
          style={[styles.favoriteButton, isFavorite && styles.favoriteActive]}
          onPress={handleFavoriteToggle}
        >
          <Text style={styles.favoriteIcon}>
            {isFavorite ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>

        {/* Edit/Delete Buttons for Owner */}
        {isOwner && (
          <View style={styles.ownerButtons}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title and Author */}
        <View style={styles.header}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.author}>por {recipe.user?.fullName}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{recipe.description}</Text>
        </View>

        {/* Recipe Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>⏱️ Tempo</Text>
            <Text style={styles.infoValue}>{recipe.cookingTime} minutos</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>👥 Porções</Text>
            <Text style={styles.infoValue}>{recipe.servings}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>📊 Dificuldade</Text>
            <Text style={[styles.infoValue, { color: getDifficultyColor(recipe.difficulty) }]}>
              {getDifficultyText(recipe.difficulty)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>🏷️ Categoria</Text>
            <Text style={styles.infoValue}>{recipe.category}</Text>
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredientes</Text>
          <Text style={styles.ingredients}>{recipe.ingredients}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modo de Preparo</Text>
          <Text style={styles.instructions}>{recipe.instructions}</Text>
        </View>

        {/* Created Date */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Criada em {new Date(recipe.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 64,
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  favoriteIcon: {
    fontSize: 24,
  },
  ownerButtons: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  editButtonText: {
    fontSize: 18,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  ingredients: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
}); 