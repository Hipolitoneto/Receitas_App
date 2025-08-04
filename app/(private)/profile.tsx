import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../src/constants/theme';
import { supabase } from '../../src/lib/supabaseClient';

export default function ProfileScreen() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) {
        Alert.alert('Erro', 'Não foi possível obter usuário.');
        setLoading(false);
        return;
      }
      setEmail(user.email!);

      const { data: profile, error: profileErr } = await supabase
        .from('users')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single();

      if (profileErr) {
      } else {
        setName(profile.name || '');
        setAvatarUrl(profile.avatar_url);
      }

      setLoading(false);
    })();
  }, []);

  async function pickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) {
      setLocalImage(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Nome obrigatório', 'Por favor, digite seu nome.');
      return;
    }

    setSaving(true);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      Alert.alert('Sessão expirada', 'Faça login novamente para continuar.');
      setSaving(false);
      router.replace('/login');
      return;
    }

    let finalAvatarUrl = avatarUrl;

    if (localImage) {
      try {
        const resp = await fetch(localImage);
        const blob = await resp.blob();
        const fileName = `${user.id}-${Date.now()}.jpg`;
        const { data: up, error: upErr } = await supabase.storage
          .from('avatars')
          .upload(fileName, blob, { upsert: true });
        
        if (upErr) {
          let errorMessage = 'Erro ao fazer upload da foto. Tente novamente.';
          
          if (upErr.message.includes('File size')) {
            errorMessage = 'A foto é muito grande. Escolha uma imagem menor (máximo 5MB).';
          } else if (upErr.message.includes('Invalid file type')) {
            errorMessage = 'Tipo de arquivo não suportado. Use apenas imagens (JPG, PNG).';
          }
          
          Alert.alert('Erro no upload', errorMessage);
          setSaving(false);
          return;
        }
        
        finalAvatarUrl = supabase.storage
          .from('avatars')
          .getPublicUrl(up.path).data.publicUrl;
      } catch (error) {
        Alert.alert('Erro na foto', 'Não foi possível processar a foto. Verifique se o arquivo não está corrompido.');
        setSaving(false);
        return;
      }
    }

    const { error: updateErr } = await supabase
      .from('users')
      .update({ name: name.trim(), avatar_url: finalAvatarUrl })
      .eq('id', user.id);

    if (updateErr) {
      Alert.alert('Erro ao salvar', 'Não foi possível salvar as alterações. Tente novamente.');
    } else {
      Alert.alert('Perfil atualizado! 🎉', 'Suas informações foram salvas com sucesso.');
      setAvatarUrl(finalAvatarUrl);
      setLocalImage(null);
    }
    setSaving(false);
  }

  async function handleLogout() {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/login');
          },
        },
      ]
    );
  }

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
            <Text style={styles.loadingText}>Carregando perfil...</Text>
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
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/recipes')}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.contentPadding}>
            <View style={styles.avatarSection}>
              <TouchableOpacity 
                style={styles.avatarContainer} 
                onPress={pickAvatar}
                activeOpacity={0.8}
              >
                {localImage || avatarUrl ? (
                  <Image
                    source={{ uri: localImage ?? avatarUrl! }}
                    style={styles.avatar}
                  />
                ) : (
                  <LinearGradient
                    colors={['#E9ECEF', '#DEE2E6']}
                    style={styles.avatarPlaceholder}
                  >
                    <Ionicons name="person" size={48} color={Colors.textSecondary} />
                  </LinearGradient>
                )}
                <View style={styles.avatarOverlay}>
                  <Ionicons name="camera" size={20} color="#FFF" />
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarText}>Toque para trocar foto</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <Ionicons name="person-outline" size={20} color={Colors.primary} />
                  <Text style={styles.inputLabel}>Nome</Text>
                </View>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholder="Digite seu nome"
                  placeholderTextColor={Colors.textSecondary}
                  maxLength={50}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <Ionicons name="mail-outline" size={20} color={Colors.primary} />
                  <Text style={styles.inputLabel}>Email</Text>
                </View>
                <TextInput 
                  value={email} 
                  editable={false} 
                  style={styles.inputDisabled}
                  placeholder="Seu email"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputHeader}>
                  <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
                  <Text style={styles.inputLabel}>Notificações</Text>
                </View>
                <View style={styles.notificationSetting}>
                  <Text style={styles.notificationText}>Receber notificações de novas receitas</Text>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: '#767577', true: Colors.primary }}
                    thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#F44336" style={{ marginRight: 8 }} />
              <Text style={styles.logoutButtonText}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFF',
    fontSize: 16,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarText: {
    marginTop: 8,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  form: {
    marginTop: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  inputDisabled: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.textSecondary,
    backgroundColor: '#F8F9FA',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },
  saveButtonDisabled: {
    backgroundColor: '#E3F2FD',
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },
  logoutButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  notificationText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginRight: 10,
  },
});