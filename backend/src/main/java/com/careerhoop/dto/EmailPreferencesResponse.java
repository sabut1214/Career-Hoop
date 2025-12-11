package com.careerhoop.dto;

import com.careerhoop.entity.UserEmailPreferences;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class EmailPreferencesResponse {
    private UUID id;
    private UUID userId;
    private Boolean collegeUpdates;
    private Boolean weeklyDigest;
    private Boolean recommendations;
    private Boolean comparisonReminders;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static EmailPreferencesResponse fromEntity(UserEmailPreferences preferences) {
        EmailPreferencesResponse response = new EmailPreferencesResponse();
        response.setId(preferences.getId());
        response.setUserId(preferences.getUserId());
        response.setCollegeUpdates(preferences.getCollegeUpdates());
        response.setWeeklyDigest(preferences.getWeeklyDigest());
        response.setRecommendations(preferences.getRecommendations());
        response.setComparisonReminders(preferences.getComparisonReminders());
        response.setCreatedAt(preferences.getCreatedAt());
        response.setUpdatedAt(preferences.getUpdatedAt());
        return response;
    }
}

