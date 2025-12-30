# CareerHoop Development Roadmap

## Phase 0: Planning & Setup (3 days)
- Git + Repo Setup
- Directory Structure
- Environment Setup
- Planning Docs

## Phase 1: Core Infrastructure (1 week)
- Frontend scaffold with React/Vite
- Backend scaffold with Spring Boot
- Database setup with PostgreSQL
- Basic CI/CD pipeline

## Phase 2: User Management (1 week)
- User registration/login
- Profile management
- Authentication/Authorization

## Phase 3: Assessment Module (2 weeks)
- Personality assessment
- Skills assessment
- Interest mapping
- Results visualization

## Phase 4: Recommendations Engine (2 weeks)
- College matching algorithm
- Career path suggestions
- Data visualization

## Phase 5: User Dashboard (1 week)
- Saved colleges
- Career path tracking
- Progress visualization

## Phase 5.5: Student UX Fixes (1-2 weeks)
- Step 1: Define scoped fixes + acceptance criteria per student flow
  - Onboarding, dashboard, assessment, recommendations, careers, colleges, trainings, profile
  - Map each issue to file locations and owner
- Step 2: Navigation + entry points
  - Add Saved Colleges and College Comparison to sidebar
  - Add in-page CTAs to reach compare and saved flows
  - Fix dead CTAs and misleading stats
- Step 3: Assessment data consistency
  - Remove unsafe student fallback lookup
  - Unify assessment storage and resume state
  - Persist assessment to backend profile
- Step 4: Safety + feedback
  - Add confirm/undo for destructive actions
  - Improve empty/error/loading states and user-facing copy
- Step 5: QA pass
  - Verify end-to-end flows and edge cases
  - Mobile/tablet layout review

## Phase 5.6: Payments (eSewa) (3-5 days)
- Add eSewa payment flow (initiate + callbacks + verification)
- Payment records + admin visibility
- Production configuration + testing (UAT → live)

## Phase 5.7: Freemium → Premium Gating (3-6 days)
- Add premium fields to users (is_premium, grade_entry_count, premium_expires_at)
- Enforce premium-only API access (trainings/careers/colleges/quizzes/recommendations)
- Free-tier limits (2 manual academic updates) + upgrade UX

## Phase 6: Testing & Refinement (1 week)
- End-to-end testing
- Performance optimization
- UI/UX refinement

## Phase 7: Deployment (3 days)
- Production environment setup
- Monitoring and logging
- Documentation finalization
