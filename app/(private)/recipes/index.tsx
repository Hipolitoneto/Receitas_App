
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { scheduleLocalNotification, useNotifications } from '../../../hooks/useNotifications';
import RecipeCard from '../../../src/components/RecipeCard';
import { Colors } from '../../../src/constants/theme';
import { supabase } from '../../../src/lib/supabaseClient';

export default function RecipesList() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date());
  const [hasNewRecipes, setHasNewRecipes] = useState(false);
  const router = useRouter();
  const { expoPushToken, notification } = useNotifications();

  async function loadRecipes(searchTerm = '') {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    let query = supabase
      .from('recipes')
      .select(`
        *,
        author:users!recipes_user_id_fkey (
          name,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (searchTerm.trim()) {
      query = query.ilike('title', `%${searchTerm.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
            } else {
      setRecipes(data || []);
    }
    setLoading(false);
  }

  async function checkForNewRecipes() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: newRecipes, error } = await supabase
        .from('recipes')
        .select(`
          *,
          author:users!recipes_user_id_fkey (
            name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .gt('created_at', lastCheckTime.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Erro ao verificar novas receitas:', error);
        return;
      }

      if (newRecipes && newRecipes.length > 0) {
        setHasNewRecipes(true);
        
        for (const recipe of newRecipes) {
          const authorName = recipe.author?.name || 'Usuário';
          await scheduleLocalNotification(
            '🍽️ Nova Receita Pública!',
            `${authorName} adicionou "${recipe.title}"`,
            {
              recipeId: recipe.id,
              type: 'new_recipe'
            }
          );
        }

        await loadRecipes(search);
      }

      setLastCheckTime(new Date());
    } catch (error) {
      console.log('Erro ao verificar novas receitas:', error);
    }
  }

  function clearNewRecipesIndicator() {
    setHasNewRecipes(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadRecipes();
    await checkForNewRecipes();
    setRefreshing(false);
  }

  async function onSearch() {
    setSearching(true);
    await loadRecipes(search);
    setSearching(false);
  }

  useEffect(() => {
    loadRecipes();
    
    const interval = setInterval(checkForNewRecipes, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (notification) {
      const data = notification.request.content.data;
      if (data?.type === 'new_recipe' && data?.recipeId) {
        router.push(`/recipes/${data.recipeId}`);
      }
    }
  }, [notification]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <LinearGradient
          colors={[Colors.primary, '#FF6B35']}
          style={styles.loadingGradient}
        >
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.loadingText}>Carregando receitas...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <LinearGradient
        colors={[Colors.primary, '#FF6B35']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Ionicons name="restaurant" size={28} color="#FFF" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>Receitas Públicas</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => router.push('/profile')}
                activeOpacity={0.8}
              >
                <Ionicons name="person" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/recipes/new')}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.refreshButton, hasNewRecipes && styles.refreshButtonActive]}
                onPress={() => {
                  checkForNewRecipes();
                  clearNewRecipesIndicator();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={24} color="#FFF" />
                {hasNewRecipes && <View style={styles.newIndicator} />}
              </TouchableOpacity>
            </View>
          </View>
          {/* Campo de busca */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar receita pública..."
              placeholderTextColor="#FFF"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={onSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchButton} onPress={onSearch} disabled={searching}>
              <Ionicons name="search" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{recipes.length}</Text>
            <Text style={styles.statLabel}>Receitas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {recipes.filter(r => r.image_url).length}
            </Text>
            <Text style={styles.statLabel}>Com Fotos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {recipes.filter(r => r.is_public).length}
            </Text>
            <Text style={styles.statLabel}>Públicas</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <FlatList
            data={recipes}
            keyExtractor={r => r.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            renderItem={({ item, index }) => (
              <RecipeCard
                recipe={item}
                onPress={() => router.push(`/recipes/${item.id}`)}
                style={{ marginTop: index === 0 ? 0 : 16 }}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="restaurant-outline" size={64} color={Colors.textSecondary} />
                </View>
                <Text style={styles.emptyTitle}>Nenhuma receita disponível</Text>
                <Text style={styles.emptyText}>
                  Comece criando sua primeira receita deliciosa!
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push('/recipes/new')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.emptyButtonText}>Criar Primeira Receita</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    marginRight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  refreshButton: {
    marginLeft: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  refreshButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  newIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  list: {
    padding: 20,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
    paddingVertical: 12,
  },
  searchButton: {
    padding: 10,
  },
});
