package com.careerhoop.dto;

public record EmailPreferencesRequest(
    Boolean collegeUpdates,
    Boolean weeklyDigest,
    Boolean recommendations,
    Boolean comparisonReminders
) {
}

