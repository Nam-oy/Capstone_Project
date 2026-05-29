import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

function parseNumber(value: string | string[] | undefined, fallback: number) {
  if (!value) return fallback;
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseText(value: string | string[] | undefined, fallback: string) {
  if (!value) return fallback;
  return Array.isArray(value) ? value[0] : value;
}

function parseFeedbackList(rawValue: string | string[] | undefined) {
  try {
    const raw = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function FeedbackScreen() {
  const params = useLocalSearchParams();

  const role = parseText(params.role, 'Software Engineer');
  const clarity = parseNumber(params.clarity, 84);
  const relevance = parseNumber(params.relevance, 82);
  const completeness = parseNumber(params.completeness, 80);
  const comment = parseText(
    params.comment,
    'Your answer is relevant and understandable, but it would be stronger with a more specific example and clearer impact.'
  );

  const feedbackList = parseFeedbackList(params.feedback);

  const averageScore = Math.round((clarity + relevance + completeness) / 3);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Feedback</Text>
      <Text style={styles.subtitle}>{role} Interview Session</Text>

      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Overall Score</Text>
        <Text style={styles.scoreValue}>{averageScore}/100</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>Clarity</Text>
        <Text style={styles.metricValue}>{clarity}/100</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>Relevance</Text>
        <Text style={styles.metricValue}>{relevance}/100</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>Completeness</Text>
        <Text style={styles.metricValue}>{completeness}/100</Text>
      </View>

      <View style={styles.commentCard}>
        <Text style={styles.commentTitle}>Overall Comment</Text>
        <Text style={styles.commentText}>{comment}</Text>
      </View>

      {feedbackList.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Feedback</Text>

          {feedbackList.map((item: any, index: number) => (
            <View key={index} style={styles.detailCard}>
              <Text style={styles.detailQuestion}>Question {index + 1}</Text>
              <Text style={styles.detailText}>{item.question}</Text>

              <Text style={styles.detailLabel}>Your Answer</Text>
              <Text style={styles.detailText}>{item.answer}</Text>

              <Text style={styles.detailLabel}>Scores</Text>
              <Text style={styles.detailText}>
                Clarity: {item.clarity} | Relevance: {item.relevance} | Completeness: {item.completeness}
              </Text>

              <Text style={styles.detailLabel}>Suggestions</Text>
              {item.suggestions?.map((suggestion: string, sIndex: number) => (
                <Text key={sIndex} style={styles.detailText}>
                  • {suggestion}
                </Text>
              ))}

              <Text style={styles.detailLabel}>Comment</Text>
              <Text style={styles.detailText}>{item.overallComment}</Text>
            </View>
          ))}
        </View>
      )}

      <Pressable style={styles.primaryButton} onPress={() => router.push('/(tabs)/history')}>
        <Text style={styles.primaryButtonText}>Go to History</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.secondaryButtonText}>Back to Home</Text>
      </Pressable>
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
    fontSize: 32,
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
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#24324a',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
  commentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
    marginBottom: 12,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#24324a',
    marginBottom: 10,
  },
  commentText: {
    fontSize: 15,
    color: '#4f5d75',
    lineHeight: 22,
    marginBottom: 6,
  },
  section: {
    marginTop: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#102a6b',
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  detailQuestion: {
    fontSize: 16,
    fontWeight: '700',
    color: '#102a6b',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#24324a',
    marginTop: 10,
    marginBottom: 4,
  },
  detailText: {
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
  },
  secondaryButtonText: {
    color: '#102a6b',
    fontSize: 16,
    fontWeight: '700',
  },
});