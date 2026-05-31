import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api, { setAuthToken } from '../../services/api';

type SessionItem = {
  _id: string;
  role: string;
  createdAt: string;
  feedback: {
    clarity: number;
    relevance: number;
    completeness: number;
    overallComment: string;
  }[];
};

export default function HistoryScreen() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadHistory = async () => {
    try {
      setErrorMessage('');

      let token: string | null = null;

      if (Platform.OS === 'web') {
        token = localStorage.getItem('token');
      } else {
        token = await SecureStore.getItemAsync('token');
      }

      setAuthToken(token);

      const response = await api.get('/history');
      setSessions(response.data || []);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to load history.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleOpenSession = (session: SessionItem) => {
    router.push({
      pathname: '/session-detail',
      params: { id: session._id },
    });
  };

  const performDelete = async (sessionId: string) => {
    try {
      let token: string | null = null;

      if (Platform.OS === 'web') {
        token = localStorage.getItem('token');
      } else {
        token = await SecureStore.getItemAsync('token');
      }

      setAuthToken(token);

      await api.delete(`/history/${sessionId}`);
      setSessions((prev) => prev.filter((session) => session._id !== sessionId));
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to delete session.';
      setErrorMessage(message);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Do you want to delete this session?');
      if (confirmed) {
        performDelete(sessionId);
      }
      return;
    }

    Alert.alert('Delete Session', 'Do you want to delete this session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          performDelete(sessionId);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Session History</Text>
      <Text style={styles.subtitle}>Review your previous interview practice sessions</Text>

      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {!sessions.length ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No interview sessions yet.</Text>
        </View>
      ) : (
        sessions.map((session) => {
          const score =
            session.feedback?.length > 0
              ? Math.round(
                  (session.feedback[0].clarity +
                    session.feedback[0].relevance +
                    session.feedback[0].completeness) /
                    3
                )
              : 0;

          return (
            <Pressable
              key={session._id}
              style={styles.card}
              onPress={() => handleOpenSession(session)}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle}>{session.role}</Text>
                <Text style={styles.cardDate}>
                  {new Date(session.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.cardRight}>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreText}>{score}/100</Text>
                </View>

                <Pressable
                  style={styles.deleteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteSession(session._id);
                  }}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </Pressable>
              </View>
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#102a6b',
    fontWeight: '600',
  },
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
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
  },
  emptyText: {
    fontSize: 15,
    color: '#4f5d75',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#24324a',
  },
  cardDate: {
    fontSize: 14,
    color: '#7b8aa5',
    marginTop: 6,
  },
  scoreBox: {
    backgroundColor: '#e8eefb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 78,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#102a6b',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});