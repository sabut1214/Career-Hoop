package com.careerhoop.dto;

import com.careerhoop.entity.SavedCollege;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class SavedCollegeResponse {
    private UUID id;
    private UUID collegeId;
    private String collegeName;
    private String collegeLocation;
    private String collegeWebsite;
    private String collegeDetailUrl;
    private LocalDateTime savedAt;

    public static SavedCollegeResponse fromEntity(SavedCollege savedCollege) {
        SavedCollegeResponse response = new SavedCollegeResponse();
        response.setId(savedCollege.getId());
        response.setCollegeId(savedCollege.getCollege().getId());
        response.setCollegeName(savedCollege.getCollege().getName());
        response.setCollegeLocation(savedCollege.getCollege().getLocation());
        response.setCollegeWebsite(savedCollege.getCollege().getWebsite());
        response.setCollegeDetailUrl(savedCollege.getCollege().getDetailUrl());
        response.setSavedAt(savedCollege.getSavedAt());
        return response;
    }
}

