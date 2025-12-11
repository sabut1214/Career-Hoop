package com.careerhoop.dto;

import java.util.List;
import java.util.UUID;

public record CollegeComparisonRequest(
    List<UUID> collegeIds
) {
}

