package com.careerhoop.dto;

import java.util.List;

public record InterestRecommendationRequest(
        List<String> careerFields,
        List<String> activities,
        List<String> workEnvironments
) {
}

