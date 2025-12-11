package com.careerhoop.dto;

import java.util.UUID;

public record QuizAnswerSubmission(UUID questionId, String selectedOption) {

    public QuizAnswerSubmission {
        if (questionId == null || selectedOption == null || selectedOption.isBlank()) {
            throw new IllegalArgumentException("questionId and selectedOption are required");
        }
    }
}
