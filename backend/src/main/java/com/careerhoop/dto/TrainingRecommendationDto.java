package com.careerhoop.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;
import java.util.UUID;

@Value
@Builder
public class TrainingRecommendationDto {
    UUID trainingId;
    String title;
    String description;
    String provider;
    String level;
    List<String> skills;
    int confidenceScore;
    String recommendationReason;
    List<String> suggestedSkills;
}

