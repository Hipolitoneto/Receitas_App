import { Colors, Typography } from '@/src/constants/theme';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFound() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Página não encontrada 😕</Text>
      <Link href="/">
        <Text style={styles.link}>Vá para tela inicial</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 16, backgroundColor: Colors.background,
  },
  title: {
    ...Typography.headline, color: Colors.text, marginBottom: 12,
  },
  link: {
    ...Typography.title, color: Colors.primary,
  },
});