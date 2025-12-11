package com.careerhoop.dto;

import java.util.List;

public record GradeRecommendationRequest(
        Double grade10,
        Double grade12,
        String stream,
        List<String> subjects
) {
}

