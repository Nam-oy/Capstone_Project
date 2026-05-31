import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { setAuthToken } from '../../services/api';

export default function HomeScreen() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const loadUserName = async () => {
      try {
        let name: string | null = null;

        if (Platform.OS === 'web') {
          name = localStorage.getItem('name');
        } else {
          name = await SecureStore.getItemAsync('name');
        }

        setUserName(name || '');
      } catch (error) {
        setUserName('');
      }
    };

    loadUserName();
  }, []);

  const performLogout = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('token');
      localStorage.removeItem('name');
    } else {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('name');
    }

    setAuthToken(null);
    router.replace('/login');
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Do you want to sign out?');
      if (confirmed) {
        await performLogout();
      }
      return;
    }

    Alert.alert('Logout', 'Do you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          performLogout();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>InterVue AI</Text>
      <Text style={styles.subtitle}>Practice smarter. Interview better.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Welcome{userName ? `, ${userName}` : ''}
        </Text>
        <Text style={styles.cardText}>
          This app helps you practice role-specific interview questions, receive AI
          feedback, and review your past sessions.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Start</Text>
        <Text style={styles.cardText}>1. Select a job role</Text>
        <Text style={styles.cardText}>2. Answer interview questions</Text>
        <Text style={styles.cardText}>3. Review your AI feedback</Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={() => router.push('/(tabs)/roles')}>
        <Text style={styles.primaryButtonText}>Start Practice</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => router.push('/(tabs)/history')}>
        <Text style={styles.secondaryButtonText}>View History</Text>
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#102a6b',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#5b6785',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#24324a',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 15,
    color: '#4f5d75',
    lineHeight: 22,
    marginBottom: 4,
  },
  primaryButton: {
    backgroundColor: '#102a6b',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#102a6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#102a6b',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ef4444',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});