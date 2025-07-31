import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useRecipe, Recipe } from '../contexts/RecipeContext';

export default function FavoritosScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const { getFavoriteRecipes, deleteRecipe, toggleFavorite, isLoading } = useRecipe();
  
  const favoriteRecipes = user ? getFavoriteRecipes(user.id) : [];

  const handleDeleteRecipe = (recipe: Recipe) => {
    Alert.alert(
      'Excluir Receita',
      `Tem certeza que deseja excluir "${recipe.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          onPress: () => deleteRecipe(recipe.id),
          style: 'destructive' 
        }
      ]
    );
  };

  const handleRecipePress = (recipe: Recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  const handleToggleFavorite = (recipe: Recipe) => {
    toggleFavorite(recipe.id);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={styles.loadingText}>Carregando favoritos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Receitas Favoritas</Text>
          <Text style={styles.subtitle}>
            {favoriteRecipes.length === 0 
              ? 'Você ainda não tem receitas favoritas. Toque no coração para favoritar!' 
              : `${favoriteRecipes.length} receita${favoriteRecipes.length !== 1 ? 's' : ''} favorita${favoriteRecipes.length !== 1 ? 's' : ''}`
            }
          </Text>
        </View>

        {favoriteRecipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>
              Nenhuma receita favorita
            </Text>
            <Text style={styles.emptySubtext}>
              Toque no coração nas suas receitas para favoritá-las
            </Text>
          </View>
        ) : (
          <View style={styles.recipesContainer}>
            {favoriteRecipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => handleRecipePress(recipe)}
              >
                {recipe.imageUri ? (
                  <Image source={{ uri: recipe.imageUri }} style={styles.recipeImage} />
                ) : (
                  <View style={styles.noImageContainer}>
                    <Text style={styles.noImageText}>Sem foto</Text>
                  </View>
                )}
                
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeName}>{recipe.name}</Text>
                  
                  <View style={styles.recipeDetails}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Tempo:</Text>
                      <Text style={styles.detailValue}>{recipe.prepTime}</Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Porções:</Text>
                      <Text style={styles.detailValue}>{recipe.servings}</Text>
                    </View>
                    
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Dificuldade:</Text>
                      <Text style={[
                        styles.difficultyText,
                        styles[`difficulty${recipe.difficulty}`]
                      ]}>
                        {recipe.difficulty}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => handleToggleFavorite(recipe)}
                >
                  <Ionicons 
                    name="heart" 
                    size={20} 
                    color="#e74c3c" 
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteRecipe(recipe)}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  recipesContainer: {
    padding: 20,
    paddingTop: 10,
  },
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  recipeImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  noImageContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  noImageText: {
    color: '#999',
    fontSize: 12,
  },
  recipeInfo: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
    paddingRight: 80, // Espaço para os botões
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  recipeDetails: {
    gap: 8,
    marginTop: 5,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    width: 70,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  difficultyFácil: {
    color: '#fff',
    backgroundColor: '#27ae60',
  },
  difficultyMédio: {
    color: '#fff',
    backgroundColor: '#f39c12',
  },
  difficultyDifícil: {
    color: '#fff',
    backgroundColor: '#e74c3c',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 45,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
}); 