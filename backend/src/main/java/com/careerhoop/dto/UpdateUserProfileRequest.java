package com.careerhoop.dto;

public record UpdateUserProfileRequest(
        String name,
        String phoneNumber,
        String location,
        String schoolName,
        String dateOfBirth,
        Double gpa,
        String profilePicture
) {
}



