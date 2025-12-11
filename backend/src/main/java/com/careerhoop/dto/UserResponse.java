package com.careerhoop.dto;

import com.careerhoop.entity.User;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class UserResponse {
    private UUID id;
    private String email;
    private String name;
    private String role;
    private String phoneNumber;
    private String location;
    private String schoolName;
    private LocalDate dateOfBirth;
    private Double gpa;
    private String profilePicture;
    private boolean profileComplete;
    private int profileCompletionPercent;
    
    // Privacy settings
    private Boolean showGpa;
    private Boolean showSavedColleges;
    private Boolean showSavedCareers;
    
    // Academic details
    private String gradeLevel;
    private String stream;
    private List<String> subjects;
    
    // Social links
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;

    public static UserResponse fromEntity(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setRole(user.getRole());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setLocation(user.getLocation());
        response.setSchoolName(user.getSchoolName());
        response.setDateOfBirth(user.getDateOfBirth());
        response.setGpa(user.getGpa());
        response.setProfilePicture(user.getProfilePicture());

        // Privacy settings
        response.setShowGpa(user.getShowGpa() != null ? user.getShowGpa() : true);
        response.setShowSavedColleges(user.getShowSavedColleges() != null ? user.getShowSavedColleges() : true);
        response.setShowSavedCareers(user.getShowSavedCareers() != null ? user.getShowSavedCareers() : true);

        // Academic details
        response.setGradeLevel(user.getGradeLevel());
        response.setStream(user.getStream());
        if (user.getSubjects() != null && !user.getSubjects().trim().isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                response.setSubjects(mapper.readValue(user.getSubjects(), new TypeReference<List<String>>() {}));
            } catch (Exception e) {
                response.setSubjects(null);
            }
        }

        // Social links
        response.setLinkedinUrl(user.getLinkedinUrl());
        response.setGithubUrl(user.getGithubUrl());
        response.setPortfolioUrl(user.getPortfolioUrl());

        int completion = calculateProfileCompletion(user);
        response.setProfileCompletionPercent(completion);
        response.setProfileComplete(completion >= 100);
        return response;
    }

    private static int calculateProfileCompletion(User user) {
        int totalFields = 7;
        int filledFields = 0;

        if (hasText(user.getName())) filledFields++;
        if (hasText(user.getEmail())) filledFields++;
        if (hasText(user.getPhoneNumber())) filledFields++;
        if (hasText(user.getLocation())) filledFields++;
        if (hasText(user.getSchoolName())) filledFields++;
        if (user.getDateOfBirth() != null) filledFields++;
        if (user.getGpa() != null) filledFields++;

        if (totalFields == 0) {
            return 100;
        }

        return (int) Math.round((filledFields / (double) totalFields) * 100);
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}


