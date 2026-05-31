import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api, { setAuthToken } from '../../services/api';

export default function InterviewScreen() {
  const params = useLocalSearchParams();
  const role =
    typeof params.role === 'string' && params.role.length > 0
      ? params.role
      : 'Software Engineer';

  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        let token: string | null = null;

        if (Platform.OS === 'web') {
          token = localStorage.getItem('token');
        } else {
          token = await SecureStore.getItemAsync('token');
        }

        setAuthToken(token);

        const response = await api.post('/interview/generate', { role });
        const loadedQuestions = response.data.questions || [];

        setQuestions(loadedQuestions);
        setAnswers(Array(loadedQuestions.length).fill(''));
      } catch (error: any) {
        const message =
          error?.response?.data?.message || 'Failed to load interview questions.';
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [role]);

  const handleChangeAnswer = (text: string) => {
    const updated = [...answers];
    updated[currentIndex] = text;
    setAnswers(updated);
  };

  const handleNextOrSubmit = async () => {
    setErrorMessage('');

    if (!answers[currentIndex]?.trim()) {
      setErrorMessage('Please enter your answer before continuing.');
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    try {
      setSubmitting(true);

      let token: string | null = null;

      if (Platform.OS === 'web') {
        token = localStorage.getItem('token');
      } else {
        token = await SecureStore.getItemAsync('token');
      }

      setAuthToken(token);

      const response = await api.post('/interview/evaluate', {
        role,
        questions,
        answers,
      });

      const feedback = response.data.feedback || [];

      if (!feedback.length) {
        setErrorMessage('No feedback was returned.');
        return;
      }

      const firstFeedback = feedback[0];

      router.push({
        pathname: '/feedback',
        params: {
          role,
          clarity: String(firstFeedback.clarity),
          relevance: String(firstFeedback.relevance),
          completeness: String(firstFeedback.completeness),
          comment: firstFeedback.overallComment,
          feedback: JSON.stringify(feedback),
        },
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Failed to submit interview answers.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  if (!questions.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>
          {errorMessage || 'No questions available.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Interview Session</Text>
      <Text style={styles.subtitle}>{role}</Text>

      <View style={styles.progressCard}>
        <Text style={styles.progressText}>
          Question {currentIndex + 1} of {questions.length}
        </Text>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionLabel}>Question</Text>
        <Text style={styles.questionText}>{questions[currentIndex]}</Text>
      </View>

      <View style={styles.answerCard}>
        <Text style={styles.answerLabel}>Your Answer</Text>
        <TextInput
          value={answers[currentIndex]}
          onChangeText={handleChangeAnswer}
          placeholder="Type your answer here..."
          multiline
          textAlignVertical="top"
          style={styles.textArea}
        />
      </View>

      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      <Pressable style={styles.primaryButton} onPress={handleNextOrSubmit} disabled={submitting}>
        <Text style={styles.primaryButtonText}>
          {submitting
            ? 'Submitting...'
            : currentIndex === questions.length - 1
            ? 'Submit Answers'
            : 'Next Question'}
        </Text>
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
    textAlign: 'center',
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
    marginBottom: 20,
  },
  progressCard: {
    backgroundColor: '#e8eefb',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  progressText: {
    color: '#102a6b',
    fontSize: 15,
    fontWeight: '600',
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#24324a',
    lineHeight: 28,
  },
  answerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#24324a',
    marginBottom: 10,
  },
  textArea: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: '#d7dfef',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#102a6b',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});