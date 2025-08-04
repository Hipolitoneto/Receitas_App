import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/theme';

interface Recipe {
  id: string;
  title: string;
  image_url?: string;
  created_at?: string;
  is_public?: boolean;
  user_id?: string;
  author?: {
    name?: string;
    avatar_url?: string;
  };
}

export default function RecipeCard({
  recipe,
  onPress,
  style,
}: {
  recipe?: Recipe;
  onPress: () => void;
  style?: any;
}) {
  if (!recipe) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Pressable 
      style={[styles.card, style]} 
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
    >
      <View style={styles.imageContainer}>
        {recipe.image_url ? (
          <Image source={{ uri: recipe.image_url }} style={styles.cover} />
        ) : (
          <LinearGradient
            colors={['#E9ECEF', '#DEE2E6']}
            style={styles.placeholder}
          >
            <Ionicons name="restaurant-outline" size={40} color={Colors.textSecondary} />
            <Text style={styles.placeholderText}>Sem imagem</Text>
          </LinearGradient>
        )}
        
        {/* Overlay com gradiente */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        />
        
        {/* Badge de data */}
        <View style={styles.dateBadge}>
          <Ionicons name="time-outline" size={12} color="#FFF" />
          <Text style={styles.dateText}>{formatDate(recipe.created_at)}</Text>
        </View>

        {/* Badge de status público/privado */}
        <View style={[
          styles.statusBadge,
          recipe.is_public ? styles.publicBadge : styles.privateBadge
        ]}>
          <Ionicons 
            name={recipe.is_public ? "globe-outline" : "lock-closed-outline"} 
            size={12} 
            color="#FFF" 
          />
          <Text style={styles.statusText}>
            {recipe.is_public ? 'Pública' : 'Privada'}
          </Text>
        </View>
      </View>
      
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.title}>
          {recipe.title}
        </Text>
        
        {/* Author Section */}
        {recipe.author && (
          <View style={styles.authorSection}>
            <View style={styles.authorInfo}>
              {recipe.author.avatar_url ? (
                <Image source={{ uri: recipe.author.avatar_url }} style={styles.authorAvatar} />
              ) : (
                <View style={styles.authorAvatarPlaceholder}>
                  <Ionicons name="person" size={16} color={Colors.textSecondary} />
                </View>
              )}
              <Text style={styles.authorName}>
                {recipe.author.name || 'Usuário'}
              </Text>
            </View>
          </View>
        )}
        
        <View style={styles.footer}>
          <View style={styles.recipeInfo}>
            <Ionicons name="restaurant" size={16} color={Colors.primary} />
            <Text style={styles.recipeType}>Receita</Text>
          </View>
          
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  cover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  dateBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  publicBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  privateBadge: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  info: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recipeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeType: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorSection: {
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});