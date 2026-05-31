# Capstone-Project
CS687- Computer Science Capstone

# InterVue AI

InterVue AI is a mobile-first mock interview application designed to help students and job seekers practice interview questions, receive automated feedback, and review their past interview sessions. The system supports user authentication, role-based interview generation, answer evaluation, feedback review, and session history tracking.

## Features

- User registration and login
- Role-based mock interview questions
- AI-generated interview feedback
- Interview session history
- Session detail review
- Retake interview flow
- Delete session history
- Web and mobile support

## Tech Stack

### Frontend
- React Native
- Expo
- Expo Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### AI Integration
- Gemini API or fallback mock evaluation

## Project Structure

```text
ai-mock-interview/
├── mobile/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── index.tsx
│   │   │   ├── roles.tsx
│   │   │   ├── interview.tsx
│   │   │   └── history.tsx
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── feedback.tsx
│   │   └── session-detail.tsx
│   └── services/
│       └── api.ts
│
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── interviewRoutes.js
│   │   │   └── historyRoutes.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── User.js
│   │   ├── InterviewSession.js
│   │   └── aiService.js
│   └── .env
└── README.md

