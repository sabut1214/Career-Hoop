package com.careerhoop.dto;

import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record QuizResultResponse(
        UUID quizSessionId,
        int totalScore,
        int correctCount,
        int incorrectCount,
        List<String> weakAreas,
        List<QuestionResultDto> questionResults
) {
}
