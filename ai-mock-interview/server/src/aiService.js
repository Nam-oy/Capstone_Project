const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

function extractText(response) {
  return response?.text || '';
}

function getMockQuestions(role) {
  const questionMap = {
    'Software Engineer': [
      'Tell me about yourself as a software engineer.',
      'Explain a technical problem you solved recently.',
      'How do you ensure code quality in your projects?',
    ],
    'Frontend Developer': [
      'Tell me about yourself as a frontend developer.',
      'How do you build responsive and user-friendly interfaces?',
      'What is the difference between state and props?',
    ],
    'Data Analyst': [
      'Tell me about yourself as a data analyst.',
      'How do you clean and prepare data before analysis?',
      'Describe a time when your analysis helped decision-making.',
    ],
  };

  return questionMap[role] || questionMap['Software Engineer'];
}

function getMockFeedback(questions, answers) {
  return questions.map((question, index) => {
    const answer = answers[index] || '';
    const answerLength = answer.trim().length;

    const clarity = Math.min(95, Math.max(70, Math.round(75 + answerLength / 12)));
    const relevance = Math.min(95, Math.max(72, Math.round(76 + answerLength / 14)));
    const completeness = Math.min(95, Math.max(68, Math.round(72 + answerLength / 13)));

    return {
      question,
      answer,
      clarity,
      relevance,
      completeness,
      suggestions: [
        'Add one more specific example from your experience.',
        'Explain the impact of your work more clearly.',
      ],
      overallComment:
        'Your answer is relevant, but it would be stronger with more detail and a clearer example.',
    };
  });
}

async function generateQuestions(role) {
  try {
    const prompt = `
Generate exactly 3 mock interview questions for the role: ${role}.

Requirements:
- suitable for a student or early-career job seeker
- clear and realistic
- mix behavioral and technical questions when appropriate
- return valid JSON only

Format:
{
  "questions": ["question 1", "question 2", "question 3"]
}
`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const text = extractText(response);

    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('Invalid question format');
    }

    return parsed.questions;
  } catch (error) {
    console.warn('Gemini question generation failed, using mock questions:', error?.message);
    return getMockQuestions(role);
  }
}

async function evaluateAnswers(role, questions, answers) {
  try {
    const prompt = `
Evaluate the user's interview answers for the role: ${role}.

Return valid JSON only as an array.

Scoring rules:
- clarity: number from 0 to 100
- relevance: number from 0 to 100
- completeness: number from 0 to 100
- suggestions: array with exactly 2 short suggestions
- overallComment: one short paragraph

Questions and answers:
${JSON.stringify(
  questions.map((question, index) => ({
    question,
    answer: answers[index] || '',
  })),
  null,
  2
)}

Required JSON format:
[
  {
    "question": "string",
    "answer": "string",
    "clarity": 80,
    "relevance": 82,
    "completeness": 78,
    "suggestions": ["suggestion 1", "suggestion 2"],
    "overallComment": "short feedback"
  }
]
`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const text = extractText(response);
    const parsed = JSON.parse(text);

    if (!Array.isArray(parsed)) {
      throw new Error('Feedback is not an array');
    }

    return parsed.map((item, index) => ({
      question: item.question || questions[index] || '',
      answer: item.answer || answers[index] || '',
      clarity: Number(item.clarity) || 0,
      relevance: Number(item.relevance) || 0,
      completeness: Number(item.completeness) || 0,
      suggestions: Array.isArray(item.suggestions) ? item.suggestions : [],
      overallComment: item.overallComment || '',
    }));
  } catch (error) {
    console.warn('Gemini evaluation failed, using mock feedback:', error?.message);
    return getMockFeedback(questions, answers);
  }
}

module.exports = {
  generateQuestions,
  evaluateAnswers,
};