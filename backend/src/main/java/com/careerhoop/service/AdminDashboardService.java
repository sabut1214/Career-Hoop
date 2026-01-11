package com.careerhoop.service;

import com.careerhoop.dto.*;
import com.careerhoop.entity.*;
import com.careerhoop.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CareerRepository careerRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private TrainingRepository trainingRepository;

    @Autowired
    private AcademicRecordRepository academicRecordRepository;

    @Autowired
    private QuizSessionRepository quizSessionRepository;

    @Autowired
    private SavedCareerRepository savedCareerRepository;

    @Autowired
    private SavedCollegeRepository savedCollegeRepository;

    public AdminDashboardStatsDto getStats() {
        return new AdminDashboardStatsDto(
                studentRepository.count(),
                careerRepository.count(),
                collegeRepository.count(),
                trainingRepository.count()
        );
    }

    public List<RecentActivityDto> getRecentActivity() {
        List<RecentActivityDto> activities = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dayAgo = now.minusDays(1);
        LocalDateTime weekAgo = now.minusDays(7);

        // User registrations (last 24 hours)
        List<User> recentUsers = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(dayAgo))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(10)
                .collect(Collectors.toList());

        for (User user : recentUsers) {
            activities.add(new RecentActivityDto(
                    "user_registration",
                    "User",
                    user.getId(),
                    user.getName() != null ? user.getName() : user.getEmail(),
                    "created",
                    user.getCreatedAt(),
                    user.getId(),
                    user.getName() != null ? user.getName() : user.getEmail()
            ));
        }

        // Career creations (last 7 days)
        List<Career> recentCareers = careerRepository.findAll().stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(weekAgo))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .collect(Collectors.toList());

        for (Career career : recentCareers) {
            activities.add(new RecentActivityDto(
                    "career_created",
                    "Career",
                    career.getId(),
                    career.getName(),
                    "created",
                    career.getCreatedAt(),
                    null,
                    null
            ));
        }

        // College creations (last 7 days)
        List<College> recentColleges = collegeRepository.findAll().stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(weekAgo))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .collect(Collectors.toList());

        for (College college : recentColleges) {
            activities.add(new RecentActivityDto(
                    "college_created",
                    "College",
                    college.getId(),
                    college.getName(),
                    "created",
                    college.getCreatedAt(),
                    null,
                    null
            ));
        }

        // Training creations (last 7 days)
        List<Training> recentTrainings = trainingRepository.findAll().stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(weekAgo))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .collect(Collectors.toList());

        for (Training training : recentTrainings) {
            activities.add(new RecentActivityDto(
                    "training_created",
                    "Training",
                    training.getId(),
                    training.getTitle(),
                    "created",
                    training.getCreatedAt(),
                    null,
                    null
            ));
        }

        // Academic record submissions (last 7 days)
        List<AcademicRecord> recentRecords = academicRecordRepository.findAll().stream()
                .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().isAfter(weekAgo))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .collect(Collectors.toList());

        for (AcademicRecord record : recentRecords) {
            activities.add(new RecentActivityDto(
                    "academic_record_submitted",
                    "AcademicRecord",
                    record.getId(),
                    "Academic Record",
                    "submitted",
                    record.getCreatedAt(),
                    record.getStudent() != null ? record.getStudent().getId() : null,
                    record.getStudent() != null ? record.getStudent().getName() : null
            ));
        }

        // Quiz completions (last 24 hours)
        List<QuizSession> recentQuizzes = quizSessionRepository.findAll().stream()
                .filter(q -> q.getCreatedAt() != null && q.getCreatedAt().isAfter(dayAgo))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .collect(Collectors.toList());

        for (QuizSession quiz : recentQuizzes) {
            activities.add(new RecentActivityDto(
                    "quiz_completed",
                    "QuizSession",
                    quiz.getId(),
                    quiz.getTraining() != null ? quiz.getTraining().getTitle() : "Quiz",
                    "completed",
                    quiz.getCreatedAt(),
                    quiz.getUserId(),
                    null
            ));
        }

        // Sort all activities by timestamp descending and limit to 20
        return activities.stream()
                .sorted((a, b) -> b.timestamp().compareTo(a.timestamp()))
                .limit(20)
                .collect(Collectors.toList());
    }

    public List<GrowthMetricsDto> getGrowthMetrics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekAgo = now.minusDays(7);

        List<GrowthMetricsDto> metrics = new ArrayList<>();

        // Students
        long currentStudents = studentRepository.count();
        long studentsWeekAgo = studentRepository.findAll().stream()
                .filter(s -> s.getCreatedAt() != null && s.getCreatedAt().isBefore(weekAgo))
                .count();
        double studentsGrowth = studentsWeekAgo > 0 ? ((currentStudents - studentsWeekAgo) * 100.0 / studentsWeekAgo) : 0.0;
        metrics.add(new GrowthMetricsDto(
                "students",
                currentStudents,
                studentsWeekAgo,
                studentsGrowth,
                studentsGrowth > 0 ? "UP" : (studentsGrowth < 0 ? "DOWN" : "STABLE")
        ));

        // Careers
        long currentCareers = careerRepository.count();
        long careersWeekAgo = careerRepository.findAll().stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isBefore(weekAgo))
                .count();
        double careersGrowth = careersWeekAgo > 0 ? ((currentCareers - careersWeekAgo) * 100.0 / careersWeekAgo) : 0.0;
        metrics.add(new GrowthMetricsDto(
                "careers",
                currentCareers,
                careersWeekAgo,
                careersGrowth,
                careersGrowth > 0 ? "UP" : (careersGrowth < 0 ? "DOWN" : "STABLE")
        ));

        // Colleges
        long currentColleges = collegeRepository.count();
        long collegesWeekAgo = collegeRepository.findAll().stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isBefore(weekAgo))
                .count();
        double collegesGrowth = collegesWeekAgo > 0 ? ((currentColleges - collegesWeekAgo) * 100.0 / collegesWeekAgo) : 0.0;
        metrics.add(new GrowthMetricsDto(
                "colleges",
                currentColleges,
                collegesWeekAgo,
                collegesGrowth,
                collegesGrowth > 0 ? "UP" : (collegesGrowth < 0 ? "DOWN" : "STABLE")
        ));

        // Trainings
        long currentTrainings = trainingRepository.count();
        long trainingsWeekAgo = trainingRepository.findAll().stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isBefore(weekAgo))
                .count();
        double trainingsGrowth = trainingsWeekAgo > 0 ? ((currentTrainings - trainingsWeekAgo) * 100.0 / trainingsWeekAgo) : 0.0;
        metrics.add(new GrowthMetricsDto(
                "trainings",
                currentTrainings,
                trainingsWeekAgo,
                trainingsGrowth,
                trainingsGrowth > 0 ? "UP" : (trainingsGrowth < 0 ? "DOWN" : "STABLE")
        ));

        return metrics;
    }

    public List<TrendDataDto> getTrends(int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        LocalDateTime startDateTime = startDate.atStartOfDay();

        Map<LocalDate, TrendDataDto> trendMap = new HashMap<>();
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            trendMap.put(currentDate, new TrendDataDto(currentDate, 0, 0, 0, 0, 0, 0));
            currentDate = currentDate.plusDays(1);
        }

        // User registrations
        userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startDateTime))
                .forEach(user -> {
                    LocalDate date = user.getCreatedAt().toLocalDate();
                    TrendDataDto existing = trendMap.get(date);
                    if (existing != null) {
                        trendMap.put(date, new TrendDataDto(
                                date,
                                existing.userRegistrations() + 1,
                                existing.careerCreations(),
                                existing.collegeCreations(),
                                existing.trainingCreations(),
                                existing.quizCompletions(),
                                existing.academicRecordSubmissions()
                        ));
                    }
                });

        // Career creations
        careerRepository.findAll().stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(startDateTime))
                .forEach(career -> {
                    LocalDate date = career.getCreatedAt().toLocalDate();
                    TrendDataDto existing = trendMap.get(date);
                    if (existing != null) {
                        trendMap.put(date, new TrendDataDto(
                                date,
                                existing.userRegistrations(),
                                existing.careerCreations() + 1,
                                existing.collegeCreations(),
                                existing.trainingCreations(),
                                existing.quizCompletions(),
                                existing.academicRecordSubmissions()
                        ));
                    }
                });

        // College creations
        collegeRepository.findAll().stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(startDateTime))
                .forEach(college -> {
                    LocalDate date = college.getCreatedAt().toLocalDate();
                    TrendDataDto existing = trendMap.get(date);
                    if (existing != null) {
                        trendMap.put(date, new TrendDataDto(
                                date,
                                existing.userRegistrations(),
                                existing.careerCreations(),
                                existing.collegeCreations() + 1,
                                existing.trainingCreations(),
                                existing.quizCompletions(),
                                existing.academicRecordSubmissions()
                        ));
                    }
                });

        // Training creations
        trainingRepository.findAll().stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(startDateTime))
                .forEach(training -> {
                    LocalDate date = training.getCreatedAt().toLocalDate();
                    TrendDataDto existing = trendMap.get(date);
                    if (existing != null) {
                        trendMap.put(date, new TrendDataDto(
                                date,
                                existing.userRegistrations(),
                                existing.careerCreations(),
                                existing.collegeCreations(),
                                existing.trainingCreations() + 1,
                                existing.quizCompletions(),
                                existing.academicRecordSubmissions()
                        ));
                    }
                });

        // Quiz completions
        quizSessionRepository.findAll().stream()
                .filter(q -> q.getCreatedAt() != null && q.getCreatedAt().isAfter(startDateTime))
                .forEach(quiz -> {
                    LocalDate date = quiz.getCreatedAt().toLocalDate();
                    TrendDataDto existing = trendMap.get(date);
                    if (existing != null) {
                        trendMap.put(date, new TrendDataDto(
                                date,
                                existing.userRegistrations(),
                                existing.careerCreations(),
                                existing.collegeCreations(),
                                existing.trainingCreations(),
                                existing.quizCompletions() + 1,
                                existing.academicRecordSubmissions()
                        ));
                    }
                });

        // Academic record submissions
        academicRecordRepository.findAll().stream()
                .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().isAfter(startDateTime))
                .forEach(record -> {
                    LocalDate date = record.getCreatedAt().toLocalDate();
                    TrendDataDto existing = trendMap.get(date);
                    if (existing != null) {
                        trendMap.put(date, new TrendDataDto(
                                date,
                                existing.userRegistrations(),
                                existing.careerCreations(),
                                existing.collegeCreations(),
                                existing.trainingCreations(),
                                existing.quizCompletions(),
                                existing.academicRecordSubmissions() + 1
                        ));
                    }
                });

        return trendMap.values().stream()
                .sorted(Comparator.comparing(TrendDataDto::date))
                .collect(Collectors.toList());
    }

    public SystemHealthDto getSystemHealth() {
        // Simple health check - can be enhanced later
        String databaseStatus = "HEALTHY";
        try {
            userRepository.count(); // Test database connection
        } catch (Exception e) {
            databaseStatus = "CRITICAL";
        }

        long apiResponseTimeMs = 0; // Can be measured if needed
        long activeUsers24h = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(LocalDateTime.now().minusDays(1)))
                .count();

        double errorRate = 0.0; // Can be calculated from logs if available
        String overallStatus = databaseStatus.equals("CRITICAL") ? "CRITICAL" : "HEALTHY";

        return new SystemHealthDto(
                databaseStatus,
                apiResponseTimeMs,
                activeUsers24h,
                errorRate,
                overallStatus
        );
    }

    public UserEngagementDto getUserEngagement() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dayAgo = now.minusDays(1);
        LocalDateTime weekAgo = now.minusDays(7);
        LocalDateTime monthAgo = now.minusDays(30);

        long activeUsers24h = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(dayAgo))
                .count();

        long activeUsers7d = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(weekAgo))
                .count();

        long activeUsers30d = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(monthAgo))
                .count();

        // Top features
        Map<String, Long> topFeatures = new HashMap<>();
        topFeatures.put("Careers Saved", savedCareerRepository.count());
        topFeatures.put("Colleges Saved", savedCollegeRepository.count());
        topFeatures.put("Quizzes Completed", quizSessionRepository.count());
        topFeatures.put("Academic Records", academicRecordRepository.count());

        // Simple retention rate calculation
        long totalUsers = userRepository.count();
        double retentionRate = totalUsers > 0 ? (activeUsers30d * 100.0 / totalUsers) : 0.0;

        long averageSessionDurationMinutes = 0; // Can be calculated if session tracking is available

        return new UserEngagementDto(
                activeUsers24h,
                activeUsers7d,
                activeUsers30d,
                topFeatures,
                retentionRate,
                averageSessionDurationMinutes
        );
    }

    public PendingCountsDto getPendingCounts() {
        LocalDateTime dayAgo = LocalDateTime.now().minusDays(1);

        long recentUsers = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(dayAgo))
                .count();

        long recentCareers = careerRepository.findAll().stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(dayAgo))
                .count();

        long recentColleges = collegeRepository.findAll().stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(dayAgo))
                .count();

        long recentTrainings = trainingRepository.findAll().stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(dayAgo))
                .count();

        long recentAcademicRecords = academicRecordRepository.findAll().stream()
                .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().isAfter(dayAgo))
                .count();

        long totalPending = recentUsers + recentCareers + recentColleges + recentTrainings + recentAcademicRecords;

        return new PendingCountsDto(
                recentUsers,
                recentCareers,
                recentColleges,
                recentTrainings,
                recentAcademicRecords,
                totalPending
        );
    }
}

