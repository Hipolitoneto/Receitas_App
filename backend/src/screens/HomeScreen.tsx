import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RecipeCard } from '../components/RecipeCard';
import { recipeService, favoriteService } from '../services/api';
import { Recipe, SearchFilters } from '../types';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadCategories();
    loadRecipes();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await recipeService.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadRecipes = async (refresh = false) => {
    try {
      const currentPage = refresh ? 1 : page;
      const filters: SearchFilters = {
        page: currentPage,
        limit: 10,
      };

      if (searchText) filters.search = searchText;
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedDifficulty) filters.difficulty = selectedDifficulty;

      const response = await recipeService.getRecipes(filters);
      
      if (refresh) {
        setRecipes(response.data);
        setPage(1);
      } else {
        setRecipes(prev => [...prev, ...response.data]);
      }

      setHasMore(response.meta ? currentPage < response.meta.last_page : false);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar receitas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRecipes(true);
  };

  const handleSearch = () => {
    setPage(1);
    loadRecipes(true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
      loadRecipes();
    }
  };

  const handleFavoriteToggle = async (recipeId: number) => {
    try {
      const isFavorite = recipes.find(r => r.id === recipeId)?.favorites?.length > 0;
      
      if (isFavorite) {
        await favoriteService.removeFavorite(recipeId);
        setRecipes(prev => prev.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, favorites: [] }
            : recipe
        ));
      } else {
        await favoriteService.addFavorite(recipeId);
        setRecipes(prev => prev.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, favorites: [{ id: 1, userId: 1, recipeId, createdAt: new Date().toISOString() }] }
            : recipe
        ));
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar favoritos');
    }
  };

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <RecipeCard
      recipe={item}
      onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
      onFavoritePress={() => handleFavoriteToggle(item.id)}
      isFavorite={item.favorites && item.favorites.length > 0}
    />
  );

  const renderFilterChip = (title: string, value: string, onPress: () => void, isSelected: boolean) => (
    <TouchableOpacity
      style={[styles.filterChip, isSelected && styles.filterChipSelected]}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando receitas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🍳 Receitas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateRecipe')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar receitas..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filtros:</Text>
        <View style={styles.filtersRow}>
          {renderFilterChip('Todas', '', () => setSelectedCategory(''), selectedCategory === '')}
          {categories.slice(0, 3).map(category => 
            renderFilterChip(
              category, 
              category, 
              () => setSelectedCategory(category), 
              selectedCategory === category
            )
          )}
        </View>
        <View style={styles.filtersRow}>
          {renderFilterChip('Todas', '', () => setSelectedDifficulty(''), selectedDifficulty === '')}
          {renderFilterChip('Fácil', 'easy', () => setSelectedDifficulty('easy'), selectedDifficulty === 'easy')}
          {renderFilterChip('Médio', 'medium', () => setSelectedDifficulty('medium'), selectedDifficulty === 'medium')}
          {renderFilterChip('Difícil', 'hard', () => setSelectedDifficulty('hard'), selectedDifficulty === 'hard')}
        </View>
      </View>

      {/* Recipe List */}
      <FlatList
        data={recipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma receita encontrada</Text>
          </View>
        }
      />
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  filterChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
}); 