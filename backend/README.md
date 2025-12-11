## CareerHoop Backend

This Spring Boot service powers the Career & Skill Based Training Quiz System.

### Prerequisites

- Java 17+
- Maven 3.9+
- PostgreSQL 15+

### Running the application

```bash
cd backend
./mvnw spring-boot:run
```

The service runs on `http://localhost:8080` by default.

### Database migrations & seed data

Flyway migrations live in `src/main/resources/db/migration`.
They include:

- `V4__training_quiz_tables.sql` – Adds training and quiz tables.
- `V5__seed_training_quiz_data.sql` – Seeds 3 trainings & starter quiz questions.
- `V6__expand_quiz_seed_data.sql` – Adds 2 new trainings + brings each quiz to 10 questions.

Run migrations & seeds:

```bash
./mvnw flyway:migrate
```

To rerun from scratch (destructive):

```bash
./mvnw -Dflyway.cleanDisabled=false flyway:clean flyway:migrate
```

### Email Configuration (Required for Password Reset)

The application requires email configuration to send password reset emails. Configure email settings via environment variables or `application.properties`.

#### Quick Setup

1. Copy the environment template:
   ```bash
   cp env.template .env
   ```

2. Edit `.env` and set your email credentials:
   ```bash
   MAIL_HOST=smtp.brevo.com
   MAIL_PORT=587
   MAIL_USERNAME=your-brevo-smtp-login
   MAIL_PASSWORD=your-brevo-smtp-key
   FRONTEND_URL=http://localhost:5173
   ```

#### Email Provider Examples

**Brevo (formerly Sendinblue) - Recommended:**
- Sign up at https://app.brevo.com/
- Go to **SMTP & API** > **SMTP** tab
- Find your **SMTP login** (usually your email) and **SMTP key**
- Use these credentials in your `.env` file
- Host: `smtp.brevo.com`, Port: `587`
- Free tier includes 300 emails/day

**Gmail:**
- Enable 2-Step Verification in your Google Account
- Generate an App Password: Google Account > Security > 2-Step Verification > App passwords
- Use the app password (not your regular password) in `MAIL_PASSWORD`

**Mailtrap (for testing):**
- Sign up at https://mailtrap.io
- Use their SMTP credentials for testing without sending real emails

**SendGrid:**
- Create account at https://sendgrid.com
- Generate SMTP API key
- Use `apikey` as `MAIL_USERNAME` and your API key as `MAIL_PASSWORD`

**Outlook/Office365:**
- Use your email and password
- Host: `smtp.office365.com`, Port: `587`

#### Environment Variables

All email settings can be configured via environment variables:
- `MAIL_HOST` - SMTP server hostname
- `MAIL_PORT` - SMTP port (587 for TLS recommended)
- `MAIL_USERNAME` - SMTP username
- `MAIL_PASSWORD` - SMTP password or app-specific password
- `FRONTEND_URL` - Frontend URL for password reset links

See `env.template` for complete configuration options.

### Useful endpoints

- `GET /api/trainings`
- `POST /api/quiz/start`
- `POST /api/quiz/submit`
- `GET /api/quiz/stats` – Aggregated quiz analytics (attempt counts, averages, weak areas)
- `POST /api/forgot-password` – Request password reset email
- `POST /api/reset-password` – Reset password with token

### Docker workflow

```bash
docker-compose up -d           # start DB + backend
docker exec -it <backend> ./mvnw flyway:migrate
docker logs -f <backend>
```

