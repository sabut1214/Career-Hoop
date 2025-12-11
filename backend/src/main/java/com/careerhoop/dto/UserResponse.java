package com.careerhoop.dto;

import com.careerhoop.entity.User;
import lombok.Data;

import java.time.LocalDate;
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


