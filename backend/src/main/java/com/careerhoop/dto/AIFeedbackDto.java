package com.careerhoop.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class AIFeedbackDto {
    String overallAssessment;
    List<String> strengths;
    List<String> improvementAreas;
    List<String> recommendedActions;
    String motivationalMessage;
    int nextScoreTarget;
}

