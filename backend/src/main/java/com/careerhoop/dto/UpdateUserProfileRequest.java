package com.careerhoop.dto;

import java.util.List;

public record UpdateUserProfileRequest(
        String name,
        String phoneNumber,
        String location,
        String schoolName,
        String dateOfBirth,
        Double gpa,
        String profilePicture,
        // Privacy settings
        Boolean showGpa,
        Boolean showSavedColleges,
        Boolean showSavedCareers,
        // Academic details
        String gradeLevel,
        String stream,
        List<String> subjects, // Will be converted to JSON string
        // Social links
        String linkedinUrl,
        String githubUrl,
        String portfolioUrl
) {
}



