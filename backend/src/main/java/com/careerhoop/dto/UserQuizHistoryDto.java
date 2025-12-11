package com.careerhoop.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.UUID;

@Value
@Builder
public class UserQuizHistoryDto {
    UUID sessionId;
    UUID trainingId;
    String trainingTitle;
    int score;
    int totalQuestions;
    LocalDateTime completedAt;
    double percentage;
}

