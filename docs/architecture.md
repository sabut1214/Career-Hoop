# CareerHoop Architecture

## System Overview

CareerHoop follows a modern client-server architecture with a clear separation of concerns:

```
Client (React) <--> API Gateway <--> Backend Services <--> Database
```

## Frontend Architecture

- **Framework**: React with Vite
- **State Management**: React Context API / Redux
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **API Communication**: Axios

## Backend Architecture

- **Framework**: Spring Boot
- **API Design**: RESTful
- **Authentication**: JWT
- **Database Access**: Spring Data JPA

## Database

- **RDBMS**: PostgreSQL
- **Migration Tool**: Flyway
- **Key Entities**:
  - Users
  - Assessments
  - Colleges
  - Careers
  - Skills

## Infrastructure

- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Deployment**: Cloud platform (AWS/Azure/GCP)

## Security Considerations

- HTTPS for all communications
- Input validation
- Rate limiting
- Data encryption at rest
- Regular security audits