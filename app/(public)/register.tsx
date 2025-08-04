
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../src/constants/theme';
import { supabase } from '../../src/lib/supabaseClient';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

    async function handleSignUp() {
    try {
      if (!email || !password || !confirmPassword) {
        Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos para criar sua conta.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Email inválido', 'Por favor, digite um email válido (exemplo: usuario@email.com)');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Senhas não coincidem', 'As senhas digitadas não são iguais. Verifique e tente novamente.');
        return;
      }

      if (password.length < 6) {
        Alert.alert('Senha muito curta', 'A senha deve ter pelo menos 6 caracteres para maior segurança.');
        return;
      }

      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        Alert.alert('Senha fraca', 'Para maior segurança, sua senha deve conter letras maiúsculas, minúsculas e números.');
        return;
      }

      setLoading(true);
      
      const {
        data: { user },
        error: signUpError,
      } = await supabase.auth.signUp({ email, password });
      
      if (signUpError || !user) {
        let errorMessage = 'Não foi possível criar sua conta. Tente novamente.';
        
        if (signUpError?.message.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login ou use outro email.';
        } else if (signUpError?.message.includes('Password should be at least')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        } else if (signUpError?.message.includes('Invalid email') || signUpError?.message.includes('Email address') && signUpError?.message.includes('is invalid') || signUpError?.code === 'email_address_invalid') {
          errorMessage = 'O email fornecido não é válido. Por favor, use um email real e válido (exemplo: seuemail@gmail.com).';
        } else if (signUpError?.message.includes('Unable to validate email address')) {
          errorMessage = 'Não foi possível validar o email. Verifique se o email está correto.';
        } else if (signUpError?.message.includes('Signup is disabled')) {
          errorMessage = 'O cadastro está temporariamente desabilitado. Tente novamente mais tarde.';
        } else if (signUpError?.message.includes('Signup not confirmed')) {
          errorMessage = 'É necessário confirmar o email para completar o cadastro.';
        }
        
        Alert.alert('Erro no cadastro', errorMessage);
        setLoading(false);
        return;
      }

      const { error: userUpsertError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: '',      
          avatar_url: ''  
        });
        
      if (userUpsertError) {
        Alert.alert('Aviso', 'Conta criada com sucesso, mas houve um problema ao salvar seu perfil. Você pode editar isso depois.');
      }

      setLoading(false);
      Alert.alert(
        'Conta criada com sucesso! 🎉', 
        'Enviamos um email de confirmação para você. Verifique sua caixa de entrada e confirme sua conta antes de fazer login.'
      );
      router.replace('/login');
      
    } catch (error) {
      setLoading(false);
      Alert.alert('Erro inesperado', 'Ocorreu um erro inesperado. Verifique sua conexão com a internet e tente novamente.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, '#FF6B35']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
                     <View style={styles.content}>
             <View style={styles.header}>
               <View style={styles.logoContainer}>
                 <Ionicons name="person-add" size={60} color="#FFF" />
               </View>
               <Text style={styles.title}>Criar Conta</Text>
               <Text style={styles.subtitle}>Junte-se ao Minhas Receitas</Text>
             </View>

             <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Seu email"
                  placeholderTextColor={Colors.textSecondary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Sua senha"
                  placeholderTextColor={Colors.textSecondary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={Colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirme sua senha"
                  placeholderTextColor={Colors.textSecondary}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={Colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>

                             <TouchableOpacity 
                 style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                 onPress={handleSignUp}
                 disabled={loading}
               >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.registerButtonText}>Criar Conta</Text>
                )}
                             </TouchableOpacity>

               <View style={styles.divider}>
                 <View style={styles.dividerLine} />
                 <Text style={styles.dividerText}>ou</Text>
                 <View style={styles.dividerLine} />
               </View>

               <TouchableOpacity 
                 style={styles.loginButton}
                 onPress={() => router.push('/login')}
               >
                 <Text style={styles.loginButtonText}>Já tenho uma conta</Text>
               </TouchableOpacity>
            </View>
          </View>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  form: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: Colors.text,
  },
  eyeIcon: {
    padding: 8,
  },
  registerButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: Colors.accent,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E9ECEF',
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  loginButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
