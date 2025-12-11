package com.careerhoop.dto;

import java.util.List;

public record QuizAnalyticsResponse(
        List<TrainingQuizStatsDto> trainingStats,
        List<WeakAreaDto> weakAreas
) {
}

