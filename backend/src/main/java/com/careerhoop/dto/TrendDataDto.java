package com.careerhoop.dto;

import java.time.LocalDate;

public record TrendDataDto(
        LocalDate date,
        long userRegistrations,
        long careerCreations,
        long collegeCreations,
        long trainingCreations,
        long quizCompletions,
        long academicRecordSubmissions
) {
}

