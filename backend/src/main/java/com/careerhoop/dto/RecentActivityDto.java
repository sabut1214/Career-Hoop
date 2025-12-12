package com.careerhoop.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record RecentActivityDto(
        String type, // "user_registration", "career_created", "college_created", "training_created", "academic_record_submitted", "quiz_completed"
        String entityType, // "User", "Career", "College", "Training", "AcademicRecord", "QuizSession"
        UUID entityId,
        String entityName,
        String action, // "created", "updated", "submitted", "completed"
        LocalDateTime timestamp,
        UUID userId,
        String userName
) {
}

