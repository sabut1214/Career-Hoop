package com.careerhoop.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record TrainingQuizStatsDto(
        UUID trainingId,
        String trainingTitle,
        long attemptCount,
        double averageScore,
        double averageTotalQuestions,
        LocalDateTime lastAttemptAt
) {
}

