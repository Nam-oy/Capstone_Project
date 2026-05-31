import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api, { setAuthToken } from '../services/api';

type FeedbackItem = {
  question: string;
  answer: string;
  clarity: number;
  relevance: number;
  completeness: number;
  suggestions: string[];
  overallComment: string;
};

type SessionDetail = {
  _id: string;
  role: string;
  questions: string[];
  answers: string[];
  feedback: FeedbackItem[];
  createdAt: string;
};

function getScoreColor(score: number) {
  if (score >= 80) return '#16a34a';
  if (score >= 50) return '#d97706';
  return '#dc2626';
}

function getOverallTip(feedback: FeedbackItem[]) {
  if (!feedback.length) return 'No feedback available yet.';

  const allScores = feedback.flatMap((item) => [
    { label: 'Clarity', value: item.clarity },
    { label: 'Relevance', value: item.relevance },
    { label: 'Completeness', value: item.completeness },
  ]);

  const lowest = allScores.reduce((prev, current) =>
    current.value < prev.value ? current : prev
  );

  if (lowest.label === 'Clarity') {
    return 'Focus on explaining your ideas more clearly and using complete examples.';
  }

  if (lowest.label === 'Relevance') {
    return 'Try to connect each answer more directly to the question being asked.';
  }

  return 'Add more detail, examples, and outcomes to make your answers more complete.';
}

export default function SessionDetailScreen() {
  const params = useLocalSearchParams();
  const sessionId = typeof params.id === 'string' ? params.id : '';

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        let token: string | null = null;

        if (Platform.OS === 'web') {
          token = localStorage.getItem('token');
        } else {
          token = await SecureStore.getItemAsync('token');
        }

        setAuthToken(token);

        const response = await api.get(`/history/${sessionId}`);
        setSession(response.data);
      } catch (error: any) {
        const message =
          error?.response?.data?.message || 'Failed to load session details.';
        if (Platform.OS === 'web') {
          console.log(message);
        } else {
          Alert.alert('Error', message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      loadSession();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const summary = useMemo(() => {
    if (!session || !session.feedback.length) {
      return {
        averageScore: 0,
        avgClarity: 0,
        avgRelevance: 0,
        avgCompleteness: 0,
        strongestArea: 'N/A',
        weakestArea: 'N/A',
        overallTip: 'No feedback available yet.',
      };
    }

    const avgClarity = Math.round(
      session.feedback.reduce((sum, item) => sum + item.clarity, 0) / session.feedback.length
    );
    const avgRelevance = Math.round(
      session.feedback.reduce((sum, item) => sum + item.relevance, 0) / session.feedback.length
    );
    const avgCompleteness = Math.round(
      session.feedback.reduce((sum, item) => sum + item.completeness, 0) / session.feedback.length
    );

    const averageScore = Math.round((avgClarity + avgRelevance + avgCompleteness) / 3);

    const areas = [
      { label: 'Clarity', value: avgClarity },
      { label: 'Relevance', value: avgRelevance },
      { label: 'Completeness', value: avgCompleteness },
    ];

    const strongestArea = areas.reduce((prev, current) =>
      current.value > prev.value ? current : prev
    ).label;

    const weakestArea = areas.reduce((prev, current) =>
      current.value < prev.value ? current : prev
    ).label;

    return {
      averageScore,
      avgClarity,
      avgRelevance,
      avgCompleteness,
      strongestArea,
      weakestArea,
      overallTip: getOverallTip(session.feedback),
    };
  }, [session]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading session details...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>No session details found.</Text>

        <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)/history')}>
          <Text style={styles.primaryButtonText}>Back to History</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Session Detail</Text>
      <Text style={styles.subtitle}>{session.role}</Text>
      <Text style={styles.dateText}>
        {new Date(session.createdAt).toLocaleString('en-US')}
      </Text>

      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Overall Session Score</Text>
        <Text style={styles.scoreValue}>{summary.averageScore}/100</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Session Summary</Text>
        <Text style={styles.summaryText}>Strongest Area: {summary.strongestArea}</Text>
        <Text style={styles.summaryText}>Weakest Area: {summary.weakestArea}</Text>
        <Text style={styles.summaryTip}>Tip: {summary.overallTip}</Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Clarity</Text>
          <Text style={[styles.metricValue, { color: getScoreColor(summary.avgClarity) }]}>
            {summary.avgClarity}
          </Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Relevance</Text>
          <Text style={[styles.metricValue, { color: getScoreColor(summary.avgRelevance) }]}>
            {summary.avgRelevance}
          </Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Complete</Text>
          <Text style={[styles.metricValue, { color: getScoreColor(summary.avgCompleteness) }]}>
            {summary.avgCompleteness}
          </Text>
        </View>
      </View>

      {session.feedback.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.questionTitle}>Question {index + 1}</Text>

          <Text style={styles.label}>Question</Text>
          <Text style={styles.text}>{item.question}</Text>

          <Text style={styles.label}>Answer</Text>
          <Text style={styles.text}>{item.answer}</Text>

          <Text style={styles.label}>Scores</Text>
          <Text style={styles.text}>
            <Text style={{ color: getScoreColor(item.clarity) }}>Clarity: {item.clarity}</Text>
            {' | '}
            <Text style={{ color: getScoreColor(item.relevance) }}>Relevance: {item.relevance}</Text>
            {' | '}
            <Text style={{ color: getScoreColor(item.completeness) }}>
              Completeness: {item.completeness}
            </Text>
          </Text>

          <Text style={styles.label}>Suggestions</Text>
          {item.suggestions?.length > 0 ? (
            item.suggestions.map((suggestion, sIndex) => (
              <Text key={sIndex} style={styles.text}>
                • {suggestion}
              </Text>
            ))
          ) : (
            <Text style={styles.text}>No suggestions available.</Text>
          )}

          <Text style={styles.label}>Overall Comment</Text>
          <Text style={styles.text}>{item.overallComment}</Text>
        </View>
      ))}

      <Pressable
        style={styles.primaryButton}
        onPress={() =>
          router.push({
            pathname: '/(tabs)/interview',
            params: { role: session.role },
          })
        }
      >
        <Text style={styles.primaryButtonText}>Retake Interview</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => router.push('/(tabs)/history')}
      >
        <Text style={styles.secondaryButtonText}>Back to History</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryButton}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.secondaryButtonText}>Go to Home</Text>
      </Pressable>
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
    marginBottom: 16,
    textAlign: 'center',
  },
  container: {
    padding: 24,
    backgroundColor: '#f5f7fb',
    flexGrow: 1,
  },
  backButton: {
    marginTop: 18,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#102a6b',
    fontWeight: '700',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#102a6b',
  },
  subtitle: {
    fontSize: 18,
    color: '#24324a',
    marginTop: 8,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    color: '#7b8aa5',
    marginTop: 6,
    marginBottom: 20,
  },
  scoreCard: {
    backgroundColor: '#102a6b',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  scoreLabel: {
    color: '#dbe7ff',
    fontSize: 15,
  },
  scoreValue: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '700',
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#102a6b',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 15,
    color: '#4f5d75',
    lineHeight: 22,
    marginBottom: 4,
  },
  summaryTip: {
    fontSize: 15,
    color: '#24324a',
    lineHeight: 22,
    marginTop: 8,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 18,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: '#5b6785',
    marginBottom: 8,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  questionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#102a6b',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#24324a',
    marginTop: 8,
    marginBottom: 4,
  },
  text: {
    fontSize: 15,
    color: '#4f5d75',
    lineHeight: 22,
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
});