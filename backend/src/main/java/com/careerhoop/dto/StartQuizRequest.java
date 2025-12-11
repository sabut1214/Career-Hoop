package com.careerhoop.dto;

import java.util.UUID;

public record StartQuizRequest(UUID userId, UUID trainingId) {

    public StartQuizRequest {
        if (userId == null || trainingId == null) {
            throw new IllegalArgumentException("userId and trainingId are required");
        }
    }
}
