import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';

const roles = [
  {
    title: 'Software Engineer',
    description: 'Practice technical and behavioral interview questions.',
  },
  {
    title: 'Frontend Developer',
    description: 'Focus on UI, state management, and responsive design questions.',
  },
  {
    title: 'Data Analyst',
    description: 'Practice analytics, reporting, and problem-solving questions.',
  },
];

export default function RolesScreen() {
  const handleSelectRole = (role: string) => {
    router.push({
      pathname: '/(tabs)/interview',
      params: { role },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Select Job Role</Text>
      <Text style={styles.subtitle}>Choose a role to start your mock interview</Text>

      {roles.map((role) => (
        <Pressable
          key={role.title}
          style={styles.card}
          onPress={() => handleSelectRole(role.title)}
        >
          <Text style={styles.cardTitle}>{role.title}</Text>
          <Text style={styles.cardText}>{role.description}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f5f7fb',
    flexGrow: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#102a6b',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#5b6785',
    marginTop: 8,
    marginBottom: 24,
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
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    color: '#4f5d75',
    lineHeight: 22,
  },
});