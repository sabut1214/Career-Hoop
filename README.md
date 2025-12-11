# CareerHoop

A comprehensive career guidance platform for students and professionals.

## Database migrations & seed data

The backend uses Flyway for schema management. Any time new migrations are added:

```bash
cd backend
./mvnw flyway:migrate
```

Running the application will also trigger Flyway automatically. Migration `V5__seed_training_quiz_data.sql` seeds three trainings plus 15 quiz questions so the quiz feature works immediately. Re-running migrations is safe thanks to `ON CONFLICT` guards in the seed script.

## Quiz & Training API

New endpoints power the “Career & Skill Based Training Quiz System”:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/trainings` | GET | Returns all trainings (title, description, provider, duration, level, skills). |
| `/api/trainings/available` | GET | Same payload as above, kept for existing frontend usage. |
| `/api/quiz/start` | POST | Body: `{ "userId": "<uuid>", "trainingId": "<uuid>" }`. Creates a quiz session and returns 10 random questions. |
| `/api/quiz/submit` | POST | Body: `{ "userId": "<uuid>", "quizSessionId": "<uuid>", "answers": [{ "questionId": "<uuid>", "selectedOption": "A" }] }`. Stores answers, scores the quiz, and returns totals plus weak-area hints. |

## Frontend helpers

Two helper functions are available in `@/lib/api` on both React builds:

- `startQuiz(trainingId, userId)`
- `submitQuiz(quizSessionId, userId, answers)`

Each function talks to the backend endpoints above and throws descriptive errors if anything fails.