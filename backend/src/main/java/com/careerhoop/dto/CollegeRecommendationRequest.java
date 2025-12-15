package com.careerhoop.dto;

import java.util.List;
import java.util.Map;

public record CollegeRecommendationRequest(
        Double grade10,
        Double grade12,
        String stream,
        List<String> subjects,
        List<Map<String, Object>> colleges,
        Integer limit
) {
}

