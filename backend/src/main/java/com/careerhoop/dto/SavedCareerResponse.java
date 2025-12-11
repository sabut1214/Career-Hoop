package com.careerhoop.dto;

import com.careerhoop.entity.SavedCareer;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class SavedCareerResponse {
    private UUID id;
    private UUID careerId;
    private String careerTitle;
    private String careerName;
    private Double confidenceScore;
    private String matchReason;
    private LocalDateTime savedAt;

    public static SavedCareerResponse fromEntity(SavedCareer savedCareer) {
        SavedCareerResponse response = new SavedCareerResponse();
        response.setId(savedCareer.getId());
        response.setCareerId(savedCareer.getCareer().getId());
        response.setCareerTitle(savedCareer.getCareer().getName());
        response.setCareerName(savedCareer.getCareer().getName());
        response.setConfidenceScore(savedCareer.getConfidenceScore());
        response.setMatchReason(savedCareer.getMatchReason());
        response.setSavedAt(savedCareer.getSavedAt());
        return response;
    }
}

