package com.careerhoop.dto;

import java.util.List;

public record CareerRecommendation(
        String id,
        String title,
        String description,
        int confidence,
        String confidenceLevel,
        String matchReason,
        String salaryRange,
        String jobGrowth,
        List<String> skills,
        List<String> opportunities,
        String category
) {
}

