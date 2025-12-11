package com.careerhoop.service;

import com.careerhoop.dto.QuizAnalyticsResponse;
import com.careerhoop.dto.TrainingQuizStatsDto;
import com.careerhoop.dto.UserQuizHistoryDto;
import com.careerhoop.dto.WeakAreaDto;
import com.careerhoop.repository.QuizAnswerRepository;
import com.careerhoop.repository.QuizSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class QuizAnalyticsService {

    @Autowired
    private QuizSessionRepository quizSessionRepository;

    @Autowired
    private QuizAnswerRepository quizAnswerRepository;

    public QuizAnalyticsResponse getAnalyticsSummary() {
        List<TrainingQuizStatsDto> trainingStats = quizSessionRepository.fetchTrainingStats();
        List<WeakAreaDto> weakAreas = quizAnswerRepository.findTopWeakAreas();
        return new QuizAnalyticsResponse(trainingStats, weakAreas);
    }

    public QuizAnalyticsResponse getUserAnalytics(UUID userId) {
        List<TrainingQuizStatsDto> trainingStats = quizSessionRepository.fetchUserTrainingStats(userId);
        List<WeakAreaDto> weakAreas = quizAnswerRepository.findUserWeakAreas(userId);
        return new QuizAnalyticsResponse(trainingStats, weakAreas);
    }

    public List<UserQuizHistoryDto> getUserQuizHistory(UUID userId) {
        return quizSessionRepository.findUserQuizHistory(userId);
    }

    public List<UserQuizHistoryDto> getUserQuizHistorySince(UUID userId, LocalDateTime since) {
        return quizSessionRepository.findUserQuizHistorySince(userId, since);
    }
}

