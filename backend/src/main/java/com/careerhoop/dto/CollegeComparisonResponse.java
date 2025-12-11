package com.careerhoop.dto;

import com.careerhoop.entity.College;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class CollegeComparisonResponse {
    private UUID id;
    private UUID userId;
    private List<College> colleges;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}

