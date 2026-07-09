import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export function LoginScreen() {
  const { login, register } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await register(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha na autenticação');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>AuraSync</Text>
      <Text style={styles.tagline}>
        Relaxamento, contemplação e expansão interior
      </Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="e-mail"
        placeholderTextColor={colors.textDim}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="senha (mín. 8 caracteres)"
        placeholderTextColor={colors.textDim}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={submit} disabled={busy}>
        {busy ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.buttonText}>
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </Text>
        )}
      </Pressable>

      <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <Text style={styles.switch}>
          {mode === 'login' ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
        </Text>
      </Pressable>

      <Text style={styles.disclaimer}>
        O AuraSync não é um tratamento médico e não substitui acompanhamento
        profissional de saúde.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 12,
  },
  logo: { color: colors.text, fontSize: 36, fontWeight: '700' },
  tagline: { color: colors.textDim, fontSize: 14, marginBottom: 20, textAlign: 'center' },
  input: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  error: { color: colors.danger, fontSize: 13 },
  button: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: { color: colors.background, fontSize: 16, fontWeight: '700' },
  switch: { color: colors.primary, fontSize: 14, marginTop: 8 },
  disclaimer: {
    color: colors.textDim,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 28,
    maxWidth: 380,
  },
});
