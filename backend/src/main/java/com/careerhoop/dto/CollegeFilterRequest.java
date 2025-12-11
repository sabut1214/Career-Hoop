package com.careerhoop.dto;

public record CollegeFilterRequest(
    String location,
    String affiliation,
    Integer minYear,
    Integer maxYear,
    String program,
    String type,
    String sortBy,
    String sortOrder
) {
    public CollegeFilterRequest {
        // Default values
        if (sortBy == null || sortBy.isBlank()) {
            sortBy = "name";
        }
        if (sortOrder == null || sortOrder.isBlank()) {
            sortOrder = "asc";
        }
    }
}

