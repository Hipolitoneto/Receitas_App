
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../../src/constants/theme';
import { supabase } from '../../../src/lib/supabaseClient';

export default function NewRecipe() {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ 
      quality: 0.7,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function handleCreate() {
    if (!title.trim()) {
      Alert.alert('Título obrigatório', 'Por favor, digite um título para sua receita.');
      return;
    }

    if (!ingredients.trim()) {
      Alert.alert('Ingredientes obrigatórios', 'Por favor, adicione os ingredientes da sua receita.');
      return;
    }

    if (!instructions.trim()) {
      Alert.alert('Instruções obrigatórias', 'Por favor, adicione as instruções de preparo da sua receita.');
      return;
    }

    setUploading(true);
    let publicUrl: string | null = null;
    if (imageUri) {
      try {
        const resp = await fetch(imageUri);
        const blob = await resp.blob();
        const fileName = `${Date.now()}.jpg`;
        const { data: up, error: upErr } = await supabase
          .storage.from('recipe-images').upload(fileName, blob);
        
        if (upErr) {
          let errorMessage = 'Erro ao fazer upload da imagem. Tente novamente.';
          
          if (upErr.message.includes('File size')) {
            errorMessage = 'A imagem é muito grande. Escolha uma imagem menor (máximo 5MB).';
          } else if (upErr.message.includes('Invalid file type')) {
            errorMessage = 'Tipo de arquivo não suportado. Use apenas imagens (JPG, PNG).';
          } else if (upErr.message.includes('Storage quota')) {
            errorMessage = 'Limite de armazenamento atingido. Tente novamente mais tarde.';
          }
          
          Alert.alert('Erro no upload', errorMessage);
          setUploading(false);
          return;
        }
        publicUrl = supabase.storage.from('recipe-images').getPublicUrl(up.path).data.publicUrl;
      } catch (error) {
        Alert.alert('Erro na imagem', 'Não foi possível processar a imagem. Verifique se o arquivo não está corrompido e tente novamente.');
        setUploading(false);
        return;
      }
    }

    const { data: { user }, error: uErr } = await supabase.auth.getUser();
    if (uErr || !user) {
      Alert.alert('Sessão expirada', 'Sua sessão expirou. Faça login novamente para continuar.');
      setUploading(false);
      router.replace('/login');
      return;
    }

    const { error } = await supabase
      .from('recipes')
      .insert([{ 
        title: title.trim(), 
        ingredients: ingredients.trim(), 
        instructions: instructions.trim(), 
        image_url: publicUrl, 
        is_public: isPublic, 
        user_id: user.id 
      }]);

    if (error) {
      let errorMessage = 'Erro ao criar receita. Tente novamente.';
      
      if (error.message.includes('duplicate key')) {
        errorMessage = 'Já existe uma receita com este título. Escolha outro título.';
      } else if (error.message.includes('violates not-null constraint')) {
        errorMessage = 'Dados incompletos. Verifique se todos os campos estão preenchidos.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      }
      
      Alert.alert('Erro ao criar receita', errorMessage);
      setUploading(false);
    } else {
      setUploading(false);
      Alert.alert(
        'Receita criada! 🎉', 
        `Sua receita "${title.trim()}" foi criada com sucesso! ${isPublic ? 'Ela está visível para todos os usuários.' : 'Ela está privada, apenas você pode vê-la.'}`
      );
      router.replace('/recipes');
    }
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nova Receita</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.contentPadding}>
              {/* Image Section */}
              <View style={styles.imageSection}>
                <TouchableOpacity 
                  style={styles.imagePicker} 
                  onPress={pickImage}
                  activeOpacity={0.8}
                >
                  {imageUri ? (
                    <View style={styles.imagePreview}>
                      <Image source={{ uri: imageUri }} style={styles.previewImage} />
                      <View style={styles.imageOverlay}>
                        <Ionicons name="camera" size={32} color="#FFF" />
                        <Text style={styles.imageOverlayText}>Trocar foto</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="camera-outline" size={48} color={Colors.primary} />
                      <Text style={styles.imagePlaceholderText}>Adicionar foto</Text>
                      <Text style={styles.imagePlaceholderSubtext}>Toque para selecionar</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Title */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputHeader}>
                    <Ionicons name="restaurant" size={20} color={Colors.primary} />
                    <Text style={styles.inputLabel}>Título da Receita *</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Bolo de Chocolate"
                    placeholderTextColor={Colors.textSecondary}
                    value={title}
                    onChangeText={setTitle}
                    maxLength={100}
                  />
                </View>

                {/* Ingredients */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputHeader}>
                    <Ionicons name="list" size={20} color={Colors.primary} />
                    <Text style={styles.inputLabel}>Ingredientes *</Text>
                  </View>
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Liste os ingredientes necessários..."
                    placeholderTextColor={Colors.textSecondary}
                    multiline
                    value={ingredients}
                    onChangeText={setIngredients}
                    textAlignVertical="top"
                  />
                </View>

                {/* Instructions */}
                <View style={styles.inputGroup}>
                  <View style={styles.inputHeader}>
                    <Ionicons name="reader" size={20} color={Colors.primary} />
                    <Text style={styles.inputLabel}>Instruções *</Text>
                  </View>
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Descreva o passo a passo..."
                    placeholderTextColor={Colors.textSecondary}
                    multiline
                    value={instructions}
                    onChangeText={setInstructions}
                    textAlignVertical="top"
                  />
                </View>

                {/* Toggle Público/Privado */}
                <View style={styles.toggleGroup}>
                  <View style={styles.toggleHeader}>
                    <Ionicons 
                      name={isPublic ? "globe-outline" : "lock-closed-outline"} 
                      size={20} 
                      color={Colors.primary} 
                    />
                    <Text style={styles.toggleLabel}>Tornar pública</Text>
                  </View>
                  <View style={styles.toggleContainer}>
                    <Switch
                      value={isPublic}
                      onValueChange={setIsPublic}
                      trackColor={{ false: '#E9ECEF', true: Colors.primary }}
                      thumbColor={isPublic ? '#FFF' : '#FFF'}
                    />
                    <Text style={styles.toggleDescription}>
                      {isPublic 
                        ? 'Qualquer pessoa pode ver esta receita' 
                        : 'Apenas você pode ver esta receita'
                      }
                    </Text>
                  </View>
                </View>

                {/* Create Button */}
                <TouchableOpacity
                  style={[styles.createButton, uploading && styles.createButtonDisabled]}
                  onPress={handleCreate}
                  disabled={uploading}
                  activeOpacity={0.8}
                >
                  {uploading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={styles.createButtonText}>Criar Receita</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  placeholder: {
    width: 44,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentPadding: {
    padding: 20,
  },
  imageSection: {
    marginBottom: 24,
  },
  imagePicker: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  imagePlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  imagePlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 12,
  },
  imagePlaceholderSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  imagePreview: {
    height: 200,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlayText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  form: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: '#F8F9FA',
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  toggleGroup: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  toggleContainer: {
    alignItems: 'center',
  },
  toggleDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: Colors.accent,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
