
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../../src/constants/theme';
import { supabase } from '../../../src/lib/supabaseClient';

export default function RecipeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
          const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          author:users!recipes_user_id_fkey (
            name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        Alert.alert('Acesso negado', 'Receita privada ou não existe.');
      } else {
        setRecipe(data);
        
        const { data: { user } } = await supabase.auth.getUser();
        const isUserOwner = user?.id === data.user_id;
        setIsOwner(isUserOwner);
        
        let userProfile = null;
        if (user) {
          const { data: profileData } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          
          userProfile = profileData;
          setIsAdmin(userProfile?.is_admin || false);
        }
      }
      setLoading(false);
    })();
  }, [id]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDelete = async () => {
            const confirmMessage = isAdmin && !isOwner 
      ? 'Você é um administrador. Tem certeza que deseja excluir esta receita de outro usuário? Esta ação não pode ser desfeita.'
      : 'Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita.';
    
            const confirmed = window.confirm(confirmMessage);
    
    if (confirmed) {
      try {
        const { data, error } = await supabase
          .from('recipes')
          .delete()
          .eq('id', id)
          .select();
        
        if (error) {
          let errorMessage = 'Não foi possível excluir a receita. Tente novamente.';
          
          if (error.message.includes('permission denied')) {
            errorMessage = 'Você não tem permissão para excluir esta receita.';
          } else if (error.message.includes('not found')) {
            errorMessage = 'Receita não encontrada. Ela pode ter sido excluída por outro usuário.';
          } else if (error.message.includes('network')) {
            errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
          } else if (error.message.includes('foreign key')) {
            errorMessage = 'Esta receita não pode ser excluída pois está sendo usada por outros recursos.';
          }
          
          alert(`Erro: ${errorMessage}`);
        } else {
          const successMessage = isAdmin && !isOwner 
            ? 'Receita excluída com sucesso! (como administrador)'
            : 'Receita excluída com sucesso!';
          alert(successMessage);
          router.replace('/recipes');
        }
      } catch (catchError) {
        alert('Erro inesperado: Verifique sua conexão com a internet e tente novamente.');
      }
    }
  };

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
            <Text style={styles.loadingText}>Carregando receita...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <LinearGradient
          colors={[Colors.primary, '#FF6B35']}
          style={styles.errorGradient}
        >
          <View style={styles.center}>
            <Ionicons name="lock-closed" size={64} color="#FFF" />
            <Text style={styles.errorTitle}>Acesso Negado</Text>
            <Text style={styles.errorText}>
              Esta receita é privada ou não existe.
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/recipes')}
            >
              <Ionicons name="arrow-back" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header com imagem */}
      <View style={styles.header}>
        {recipe.image_url ? (
          <Image source={{ uri: recipe.image_url }} style={styles.headerImage} />
        ) : (
          <LinearGradient
            colors={['#E9ECEF', '#DEE2E6']}
            style={styles.headerPlaceholder}
          >
            <Ionicons name="restaurant-outline" size={80} color={Colors.textSecondary} />
            <Text style={styles.headerPlaceholderText}>Sem imagem</Text>
          </LinearGradient>
        )}
        
        {/* Overlay gradiente */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.headerOverlay}
        />
        
        {/* Botão voltar */}
        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={() => router.replace('/recipes')}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        
        {/* Data da receita */}
        <View style={styles.dateContainer}>
          <Ionicons name="time-outline" size={16} color="#FFF" />
          <Text style={styles.dateText}>{formatDate(recipe.created_at)}</Text>
        </View>

        {/* Status público/privado */}
        <View style={[
          styles.statusContainer,
          recipe.is_public ? styles.publicStatus : styles.privateStatus
        ]}>
          <Ionicons 
            name={recipe.is_public ? "globe-outline" : "lock-closed-outline"} 
            size={16} 
            color="#FFF" 
          />
          <Text style={styles.statusText}>
            {recipe.is_public ? 'Pública' : 'Privada'}
          </Text>
        </View>

        {/* Botão de exclusão (apenas para o dono ou admin) */}
        {(isOwner || isAdmin) && (
          <TouchableOpacity
            style={[
              styles.deleteButton,
              isAdmin && !isOwner && styles.adminDeleteButton
            ]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Conteúdo */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentPadding}>
          {/* Título */}
          <Text style={styles.title}>{recipe.title}</Text>
          
          {/* Seção Autor */}
          {recipe.author && (
            <View style={styles.authorSection}>
              <View style={styles.authorInfo}>
                {recipe.author.avatar_url ? (
                  <Image source={{ uri: recipe.author.avatar_url }} style={styles.authorAvatar} />
                ) : (
                  <View style={styles.authorAvatarPlaceholder}>
                    <Ionicons name="person" size={20} color={Colors.textSecondary} />
                  </View>
                )}
                <View style={styles.authorDetails}>
                  <Text style={styles.authorName}>
                    {recipe.author.name || 'Usuário'}
                  </Text>
                  <Text style={styles.authorLabel}>Autor da receita</Text>
                </View>
              </View>
            </View>
          )}
          
          {/* Seção Ingredientes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Ingredientes</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.body}>{recipe.ingredients}</Text>
            </View>
          </View>

          {/* Seção Instruções */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="reader-outline" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Instruções</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.body}>{recipe.instructions}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
  },
  errorGradient: {
    flex: 1,
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
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerPlaceholderText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  backButtonHeader: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  publicStatus: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  privateStatus: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  statusText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  deleteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminDeleteButton: {
            backgroundColor: 'rgba(255, 152, 0, 0.9)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentPadding: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24,
    lineHeight: 36,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  sectionContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  body: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  authorSection: {
    marginBottom: 32,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  authorAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  authorLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
