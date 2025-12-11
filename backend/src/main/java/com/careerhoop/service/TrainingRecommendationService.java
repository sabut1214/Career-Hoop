package com.careerhoop.service;

import com.careerhoop.dto.TrainingRecommendationDto;
import com.careerhoop.dto.UserQuizHistoryDto;
import com.careerhoop.dto.WeakAreaDto;
import com.careerhoop.entity.Training;
import com.careerhoop.repository.QuizAnswerRepository;
import com.careerhoop.repository.QuizSessionRepository;
import com.careerhoop.repository.TrainingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TrainingRecommendationService {

    @Autowired
    private TrainingRepository trainingRepository;

    @Autowired
    private QuizSessionRepository quizSessionRepository;

    @Autowired
    private QuizAnswerRepository quizAnswerRepository;

    public List<TrainingRecommendationDto> getRecommendedTrainings(UUID userId) {
        // Limit history to last 20 quizzes for performance
        List<UserQuizHistoryDto> userHistory = quizSessionRepository.findUserQuizHistory(userId)
                .stream()
                .limit(20)
                .collect(Collectors.toList());
        List<WeakAreaDto> userWeakAreas = quizAnswerRepository.findUserWeakAreas(userId)
                .stream()
                .limit(50) // Limit to top 50 weak areas
                .collect(Collectors.toList());

        Set<UUID> completedTrainingIds = userHistory.stream()
                .map(UserQuizHistoryDto::getTrainingId)
                .collect(Collectors.toSet());

        List<Training> allTrainings = trainingRepository.findAll();
        List<TrainingRecommendationDto> recommendations = new ArrayList<>();

        Map<String, Integer> skillFrequency = new HashMap<>();
        for (WeakAreaDto weakArea : userWeakAreas) {
            String trainingTitle = weakArea.trainingTitle();
            skillFrequency.put(trainingTitle, skillFrequency.getOrDefault(trainingTitle, 0) + (int) weakArea.incorrectCount());
        }

        for (Training training : allTrainings) {
            if (completedTrainingIds.contains(training.getId())) {
                continue;
            }

            int confidenceScore = calculateConfidenceScore(training, userHistory, userWeakAreas, skillFrequency);
            if (confidenceScore < 30) {
                continue;
            }

            String reason = generateRecommendationReason(training, userHistory, userWeakAreas);
            List<String> suggestedSkills = extractSuggestedSkills(training, userWeakAreas);

            recommendations.add(TrainingRecommendationDto.builder()
                    .trainingId(training.getId())
                    .title(training.getTitle())
                    .description(training.getDescription())
                    .provider(training.getProvider())
                    .level(training.getLevel())
                    .skills(training.getSkills() != null ? Arrays.asList(training.getSkills()) : Collections.emptyList())
                    .confidenceScore(confidenceScore)
                    .recommendationReason(reason)
                    .suggestedSkills(suggestedSkills)
                    .build());
        }

        return recommendations.stream()
                .sorted(Comparator.comparing(TrainingRecommendationDto::getConfidenceScore).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }

    private int calculateConfidenceScore(Training training, List<UserQuizHistoryDto> userHistory,
                                        List<WeakAreaDto> userWeakAreas, Map<String, Integer> skillFrequency) {
        int score = 50;

        if (userHistory.isEmpty()) {
            return 60;
        }

        double avgScore = userHistory.stream()
                .mapToDouble(UserQuizHistoryDto::getPercentage)
                .average()
                .orElse(0.0);

        if (avgScore < 50) {
            score += 20;
        } else if (avgScore < 70) {
            score += 10;
        }

        long weakAreaMatches = userWeakAreas.stream()
                .filter(wa -> wa.trainingTitle().equals(training.getTitle()))
                .count();

        if (weakAreaMatches > 0) {
            score += 15;
        }

        if (training.getSkills() != null) {
            Set<String> trainingSkills = new HashSet<>(Arrays.asList(training.getSkills()));
            long matchingSkills = userWeakAreas.stream()
                    .filter(wa -> trainingSkills.contains(wa.trainingTitle()))
                    .count();
            score += (int) (matchingSkills * 5);
        }

        return Math.min(100, score);
    }

    private String generateRecommendationReason(Training training, List<UserQuizHistoryDto> userHistory,
                                                List<WeakAreaDto> userWeakAreas) {
        if (userHistory.isEmpty()) {
            return "Start your learning journey with this foundational training.";
        }

        long weakAreaMatches = userWeakAreas.stream()
                .filter(wa -> wa.trainingTitle().equals(training.getTitle()))
                .count();

        if (weakAreaMatches > 0) {
            return String.format("Based on your quiz performance, this training addresses %d areas where you need improvement.",
                    weakAreaMatches);
        }

        double avgScore = userHistory.stream()
                .mapToDouble(UserQuizHistoryDto::getPercentage)
                .average()
                .orElse(0.0);

        if (avgScore < 60) {
            return "This training will help strengthen your foundational skills and improve your overall performance.";
        }

        return "This training complements your current knowledge and will help you advance to the next level.";
    }

    private List<String> extractSuggestedSkills(Training training, List<WeakAreaDto> userWeakAreas) {
        if (training.getSkills() == null) {
            return Collections.emptyList();
        }

        List<String> suggested = new ArrayList<>(Arrays.asList(training.getSkills()));

        Set<String> weakTrainingTitles = userWeakAreas.stream()
                .map(WeakAreaDto::trainingTitle)
                .collect(Collectors.toSet());

        if (weakTrainingTitles.contains(training.getTitle())) {
            suggested.add("Focus on areas where you struggled in previous quizzes");
        }

        return suggested;
    }
}

