package com.careerhoop.dto;

public record SaveCareerByNameRequest(
        String careerName,
        Double confidenceScore,
        String matchReason
) {
}

