import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { useRecipe } from '../contexts/RecipeContext';

export default function AddRecipeScreen({ navigation }: { navigation: any }) {
  const { user } = useAuth();
  const { addRecipe } = useRecipe();
  
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [servings, setServings] = useState('');
  const [difficulty, setDifficulty] = useState<'Fácil' | 'Médio' | 'Difícil'>('Fácil');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua galeria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua câmera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !ingredients.trim() || !instructions.trim() || !prepTime.trim() || !servings.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para adicionar receitas.');
      return;
    }

    setIsLoading(true);
    try {
      const ingredientsList = ingredients
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      const instructionsList = instructions
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      await addRecipe({
        name: name.trim(),
        ingredients: ingredientsList,
        instructions: instructionsList,
        prepTime: prepTime.trim(),
        servings: parseInt(servings),
        difficulty,
        imageUri: imageUri || undefined,
        userId: user.id,
      });

      Alert.alert('Sucesso', 'Receita adicionada com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao adicionar receita. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Adicionar Nova Receita</Text>

          {/* Imagem */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Foto da Receita</Text>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
                  <Text style={styles.changeImageText}>Trocar Imagem</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imageButtons}>
                <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                  <Text style={styles.imageButtonText}>Escolher da Galeria</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                  <Text style={styles.imageButtonText}>Tirar Foto</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Nome da Receita */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome da Receita *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Bolo de Chocolate"
            />
          </View>

          {/* Tempo de Preparo */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Tempo de Preparo *</Text>
              <TextInput
                style={styles.input}
                value={prepTime}
                onChangeText={setPrepTime}
                placeholder="Ex: 45 min"
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Porções *</Text>
              <TextInput
                style={styles.input}
                value={servings}
                onChangeText={setServings}
                placeholder="Ex: 4"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Dificuldade */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dificuldade</Text>
            <View style={styles.difficultyButtons}>
              {(['Fácil', 'Médio', 'Difícil'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.difficultyButton,
                    difficulty === level && styles.difficultyButtonActive
                  ]}
                  onPress={() => setDifficulty(level)}
                >
                  <Text style={[
                    styles.difficultyButtonText,
                    difficulty === level && styles.difficultyButtonTextActive
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ingredientes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ingredientes *</Text>
            <Text style={styles.hint}>Digite um ingrediente por linha</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={ingredients}
              onChangeText={setIngredients}
              placeholder="Ex:&#10;2 xícaras de farinha&#10;1 xícara de açúcar&#10;3 ovos"
              multiline
              numberOfLines={6}
            />
          </View>

          {/* Instruções */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instruções *</Text>
            <Text style={styles.hint}>Digite uma instrução por linha</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Ex:&#10;1. Pré-aqueça o forno a 180°C&#10;2. Misture os ingredientes secos&#10;3. Adicione os ingredientes úmidos"
              multiline
              numberOfLines={8}
            />
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Salvando...' : 'Salvar Receita'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  changeImageButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 8,
  },
  changeImageText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  imageButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    flex: 0.48,
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    marginHorizontal: 2,
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: '#f4511e',
    borderColor: '#f4511e',
  },
  difficultyButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  difficultyButtonTextActive: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 