package com.careerhoop.dto;

import java.util.List;
import java.util.UUID;

public record QuizSubmitRequest(UUID userId, UUID quizSessionId, List<QuizAnswerSubmission> answers) {

    public QuizSubmitRequest {
        if (userId == null || quizSessionId == null || answers == null || answers.isEmpty()) {
            throw new IllegalArgumentException("userId, quizSessionId, and at least one answer are required");
        }
    }
}
