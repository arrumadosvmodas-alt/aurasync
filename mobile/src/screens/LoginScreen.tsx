import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useApp } from '../context/AppContext';
import { colors, rounded, typography } from '../theme';

export function LoginScreen() {
  const { login, setUserRole } = useApp();
  const [username, setUsername] = useState('Gabriel');
  const [password, setPassword] = useState('******');
  const [isAdmin, setIsAdmin] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const email = username.includes('@') ? username.trim() : `${username.trim().toLowerCase()}@aurasync.com`;
      await login(email, password, isAdmin);
      setUserRole(isAdmin ? 'admin' : 'user');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha na autenticação');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <MaterialCommunityIcons
            name="spa"
            size={56}
            color="#7DA083"
            style={styles.logoIcon}
          />
          
          <Text style={styles.title}>AURA SYNC</Text>
          <Text style={styles.subtitle}>Monorepo de 3 Camadas Integradas</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Nome de Usuário</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Digite seu usuário..."
              placeholderTextColor="#797869"
              autoCapitalize="none"
              testID="username_input"
            />

            <Text style={styles.label}>Senha JWT (PBKDF2)</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha..."
              placeholderTextColor="#797869"
              secureTextEntry
              testID="password_input"
            />

            <Pressable
              style={styles.checkboxContainer}
              onPress={() => setIsAdmin(!isAdmin)}
            >
              <View style={[styles.checkbox, isAdmin && styles.checkboxChecked]}>
                {isAdmin && (
                  <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                )}
              </View>
              <View style={styles.checkboxLabelContainer}>
                <Text style={styles.checkboxTitle}>Simular Perfil Admin (CMS)</Text>
                <Text style={styles.checkboxSubtitle}>
                  Permite CRUD e validação de licenças
                </Text>
              </View>
            </Pressable>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              style={styles.button}
              onPress={submit}
              disabled={busy}
              testID="login_button"
            >
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Autenticar e Entrar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF9F1', // Light warm cream background matching cosmic linear gradient base
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(230, 225, 212, 0.95)', // Color(0xFFE6E1D4).copy(alpha = 0.95f)
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.5)', // Color(0xFFA8B59E).copy(alpha = 0.5f)
    padding: 24,
    alignItems: 'center',
    shadowColor: '#141E0D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  logoIcon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#141E0D',
    letterSpacing: 2,
    fontFamily: typography.headlineMd.fontFamily,
  },
  subtitle: {
    fontSize: 12,
    color: '#797869',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
    fontFamily: typography.bodyMd.fontFamily,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#797869',
    marginBottom: 6,
    fontFamily: typography.labelSm.fontFamily,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(168, 181, 158, 0.5)',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1D1C16',
    marginBottom: 16,
    fontFamily: typography.bodyMd.fontFamily,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#797869',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#7DA083', // Color(0xFF7DA083)
    borderColor: '#7DA083',
  },
  checkboxLabelContainer: {
    flex: 1,
  },
  checkboxTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1C16',
    fontFamily: typography.labelMd.fontFamily,
  },
  checkboxSubtitle: {
    fontSize: 11,
    color: '#797869',
    marginTop: 2,
    fontFamily: typography.bodyMd.fontFamily,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: typography.bodyMd.fontFamily,
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#141E0D', // Color(0xFF141E0D)
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: typography.labelMd.fontFamily,
  },
});
