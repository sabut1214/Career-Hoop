package com.careerhoop.dto;

import java.util.List;

/**
 * Request payload for AI-powered college recommendations that combine
 * academic profile (grades) with interest profile (career fields, activities, work environments).
 */
public record CollegeAIRecommendationRequest(
        Double grade10,
        Double grade12,
        String stream,
        List<String> subjects,
        List<String> careerFields,
        List<String> activities,
        List<String> workEnvironments
) {
}


