package com.careerhoop.dto;

import java.util.Map;

public record EsewaV2InitiateResponse(
        String actionUrl,
        Map<String, String> fields
) {
}
