package com.careerhoop.dto;

import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record StartQuizResponse(UUID quizSessionId, List<QuizQuestionDto> questions) {
}
