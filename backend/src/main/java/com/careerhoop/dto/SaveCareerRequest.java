package com.careerhoop.dto;

import java.util.UUID;

public record SaveCareerRequest(
        UUID careerId,
        Double confidenceScore,
        String matchReason
) {
}

