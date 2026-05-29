const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

function extractText(response) {
  if (!response) return '';

  if (typeof response.output_text === 'string' && response.output_text.trim()) {
    return response.output_text;
  }

  if (Array.isArray(response.output)) {
    const texts = [];

    for (const item of response.output) {
      if (item.type === 'message' && Array.isArray(item.content)) {
        for (const content of item.content) {
          if (content.type === 'output_text' && content.text) {
            texts.push(content.text);
          }
        }
      }
    }

    return texts.join('\n').trim();
  }

  return '';
}

async function generateQuestions(role) {
  const prompt = `
Generate exactly 3 mock interview questions for the job role: ${role}.

Requirements:
- The questions must be suitable for a student or early-career job seeker.
- Mix behavioral and technical questions when appropriate.
- Keep the questions clear and realistic.
- Return valid JSON only.
- Format:
{
  "questions": ["question 1", "question 2", "question 3"]
}
`;

  const response = await client.responses.create({
    model: MODEL,
    instructions:
      'You are an interview coach. Follow the requested JSON format exactly and do not include markdown.',
    input: prompt,
    temperature: 0.7,
  });

  const text = extractText(response);

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed.questions;
    }
    throw new Error('Invalid question format');
  } catch (error) {
    throw new Error(`Failed to parse generated questions: ${text}`);
  }
}

async function evaluateAnswers(role, questions, answers) {
  const prompt = `
Evaluate the user's interview answers for the role: ${role}.

You will receive a list of questions and answers.
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

  const response = await client.responses.create({
    model: MODEL,
    instructions:
      'You are an interview evaluator. Be constructive, fair, and return only valid JSON with no markdown.',
    input: prompt,
    temperature: 0.3,
  });

  const text = extractText(response);

  try {
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
    throw new Error(`Failed to parse evaluation feedback: ${text}`);
  }
}

module.exports = {
  generateQuestions,
  evaluateAnswers,
};