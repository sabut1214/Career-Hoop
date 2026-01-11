package com.careerhoop.dto;

import jakarta.validation.constraints.NotBlank;

public record EsewaV2VerifyRequest(
        @NotBlank(message = "Data parameter is required")
        String data
) {
}
