package com.careerhoop.service;

import com.careerhoop.dto.AIFeedbackDto;
import com.careerhoop.dto.UserQuizHistoryDto;
import com.careerhoop.dto.WeakAreaDto;
import com.careerhoop.repository.QuizAnswerRepository;
import com.careerhoop.repository.QuizSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIFeedbackService {

    @Autowired
    private QuizSessionRepository quizSessionRepository;

    @Autowired
    private QuizAnswerRepository quizAnswerRepository;

    public AIFeedbackDto generateFeedback(UUID userId) {
        // Limit history to last 20 quizzes for performance
        List<UserQuizHistoryDto> userHistory = quizSessionRepository.findUserQuizHistory(userId)
                .stream()
                .limit(20)
                .collect(Collectors.toList());
        List<WeakAreaDto> userWeakAreas = quizAnswerRepository.findUserWeakAreas(userId)
                .stream()
                .limit(50) // Limit to top 50 weak areas
                .collect(Collectors.toList());

        if (userHistory.isEmpty()) {
            return AIFeedbackDto.builder()
                    .overallAssessment("You're just getting started! Complete your first quiz to receive personalized feedback.")
                    .strengths(Collections.emptyList())
                    .improvementAreas(Collections.emptyList())
                    .recommendedActions(List.of("Take your first quiz to begin tracking your progress"))
                    .motivationalMessage("Every expert was once a beginner. Start your learning journey today!")
                    .nextScoreTarget(70)
                    .build();
        }

        double avgScore = userHistory.stream()
                .mapToDouble(UserQuizHistoryDto::getPercentage)
                .average()
                .orElse(0.0);

        int totalAttempts = userHistory.size();
        double latestScore = userHistory.get(0).getPercentage();

        String assessment = generateOverallAssessment(avgScore, latestScore, totalAttempts);
        List<String> strengths = identifyStrengths(userHistory, userWeakAreas);
        List<String> improvementAreas = identifyImprovementAreas(userWeakAreas);
        List<String> recommendedActions = generateRecommendedActions(userHistory, userWeakAreas);
        String motivationalMessage = generateMotivationalMessage(avgScore, latestScore);
        int nextScoreTarget = calculateNextScoreTarget(avgScore);

        return AIFeedbackDto.builder()
                .overallAssessment(assessment)
                .strengths(strengths)
                .improvementAreas(improvementAreas)
                .recommendedActions(recommendedActions)
                .motivationalMessage(motivationalMessage)
                .nextScoreTarget(nextScoreTarget)
                .build();
    }

    private String generateOverallAssessment(double avgScore, double latestScore, int totalAttempts) {
        if (latestScore >= 90) {
            return String.format("Outstanding performance! Your latest score of %.1f%% shows excellent mastery. Keep up the excellent work!", latestScore);
        } else if (latestScore >= 75) {
            return String.format("Great job! You're performing well with a score of %.1f%%. With %d attempts, you're building strong knowledge.", latestScore, totalAttempts);
        } else if (latestScore >= 60) {
            return String.format("Good progress! Your score of %.1f%% shows you're on the right track. Focus on weak areas to improve further.", latestScore);
        } else {
            return String.format("Keep practicing! Your score of %.1f%% indicates areas for improvement. Review the material and try again.", latestScore);
        }
    }

    private List<String> identifyStrengths(List<UserQuizHistoryDto> userHistory, List<WeakAreaDto> userWeakAreas) {
        List<String> strengths = new ArrayList<>();

        if (userHistory.size() >= 3) {
            double recentAvg = userHistory.stream()
                    .limit(3)
                    .mapToDouble(UserQuizHistoryDto::getPercentage)
                    .average()
                    .orElse(0.0);

            if (recentAvg > userHistory.stream()
                    .skip(3)
                    .mapToDouble(UserQuizHistoryDto::getPercentage)
                    .average()
                    .orElse(0.0)) {
                strengths.add("Showing consistent improvement over time");
            }
        }

        Set<String> completedTrainings = userHistory.stream()
                .map(UserQuizHistoryDto::getTrainingTitle)
                .collect(Collectors.toSet());
        strengths.add(String.format("Completed quizzes in %d different training areas", completedTrainings.size()));

        long highScores = userHistory.stream()
                .filter(h -> h.getPercentage() >= 80)
                .count();
        if (highScores > 0) {
            strengths.add(String.format("Achieved high scores (%d times with 80%%+)", highScores));
        }

        return strengths.isEmpty() ? List.of("Consistent participation in quizzes") : strengths;
    }

    private List<String> identifyImprovementAreas(List<WeakAreaDto> userWeakAreas) {
        if (userWeakAreas.isEmpty()) {
            return List.of("Continue practicing to maintain your strong performance");
        }

        Map<String, Long> trainingWeakCounts = userWeakAreas.stream()
                .collect(Collectors.groupingBy(WeakAreaDto::trainingTitle, Collectors.counting()));

        List<String> improvements = new ArrayList<>();
        trainingWeakCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(3)
                .forEach(entry -> improvements.add(
                        String.format("Focus on %s (%d areas need attention)", entry.getKey(), entry.getValue())
                ));

        return improvements;
    }

    private List<String> generateRecommendedActions(List<UserQuizHistoryDto> userHistory, List<WeakAreaDto> userWeakAreas) {
        List<String> actions = new ArrayList<>();

        if (userHistory.size() < 3) {
            actions.add("Take more quizzes to build a comprehensive learning profile");
        }

        if (!userWeakAreas.isEmpty()) {
            String topWeakTraining = userWeakAreas.stream()
                    .collect(Collectors.groupingBy(WeakAreaDto::trainingTitle, Collectors.counting()))
                    .entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("");

            if (!topWeakTraining.isEmpty()) {
                actions.add(String.format("Review and retake quizzes for %s to strengthen weak areas", topWeakTraining));
            }
        }

        double avgScore = userHistory.stream()
                .mapToDouble(UserQuizHistoryDto::getPercentage)
                .average()
                .orElse(0.0);

        if (avgScore < 70) {
            actions.add("Focus on foundational concepts before moving to advanced topics");
        }

        Set<String> completedTrainings = userHistory.stream()
                .map(UserQuizHistoryDto::getTrainingTitle)
                .collect(Collectors.toSet());
        if (completedTrainings.size() < 3) {
            actions.add("Explore different training areas to broaden your skill set");
        }

        return actions.isEmpty() ? List.of("Continue practicing and exploring new topics") : actions;
    }

    private String generateMotivationalMessage(double avgScore, double latestScore) {
        if (latestScore >= 90) {
            return "🌟 Exceptional work! You're mastering the material. Keep challenging yourself!";
        } else if (latestScore >= 75) {
            return "💪 Great progress! You're building strong knowledge. Keep up the momentum!";
        } else if (latestScore >= 60) {
            return "📚 You're on the right track! Every quiz is a learning opportunity. Keep going!";
        } else {
            return "🎯 Don't give up! Review the material and try again. Improvement comes with practice!";
        }
    }

    private int calculateNextScoreTarget(double avgScore) {
        if (avgScore >= 90) {
            return 95;
        } else if (avgScore >= 75) {
            return (int) Math.ceil(avgScore + 5);
        } else if (avgScore >= 60) {
            return (int) Math.ceil(avgScore + 10);
        } else {
            return 60;
        }
    }
}

