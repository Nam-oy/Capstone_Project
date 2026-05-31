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






Installation

1. Clone the repository
git clone <your-repository-url>
cd ai-mock-interview
2. Install backend dependencies
cd server
npm install
3. Install frontend dependencies
cd ../mobile
npm install
Environment Variables

Create a .env file inside the server folder.

Example
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/ai_mock_interview
JWT_SECRET=your_super_secret_key_123
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

If you are using OpenAI instead of Gemini, replace the AI variables accordingly.

Running the Project
Start the backend
cd server
npm run dev
Start the frontend
cd mobile
npx expo start
Run on web

Press:

w
Run on mobile
Use Expo Go
Make sure your phone and computer are on the same Wi-Fi
Update mobile/services/api.ts with your computer's local IP address if testing on a real phone

Example:

const BASE_URL = 'http://192.168.1.23:5001/api';
API Endpoints
Auth
POST /api/auth/register
POST /api/auth/login
Interview
POST /api/interview/generate
POST /api/interview/evaluate
History
GET /api/history
GET /api/history/:id
DELETE /api/history/:id
Main Workflow
User registers or logs in
User selects a target job role
The system generates interview questions
The user submits answers
The system evaluates answers and returns feedback
The session is saved in MongoDB
The user can review session history and details later
Database Usage

MongoDB is used as the main database for the system. It stores:

User accounts
Interview sessions
Selected roles
Generated questions
User answers
AI feedback
Session history
Current MVP Scope

The current MVP includes:

Authentication
Role selection
Interview generation
Answer submission
AI-based or mock evaluation
Feedback display
History tracking
Session detail review
Delete session history
Future Improvements

Possible future improvements include:

Forgot password
Profile management
Better analytics dashboard
More job roles
More advanced AI evaluation
Export feedback summary
Favorite interview sessions
Notes
Web uses localStorage for token persistence
Mobile uses SecureStore
If AI quota is unavailable, the system can use fallback mock questions and feedback
Author

Siraphat Mingsorn

License

This project is for educational and capstone purposes.