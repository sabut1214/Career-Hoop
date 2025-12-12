package com.careerhoop.dto;

public record PendingCountsDto(
        long recentUsers, // created in last 24 hours
        long recentCareers,
        long recentColleges,
        long recentTrainings,
        long recentAcademicRecords,
        long totalPending
) {
}

