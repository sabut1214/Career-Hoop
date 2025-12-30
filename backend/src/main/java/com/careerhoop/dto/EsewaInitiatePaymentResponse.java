package com.careerhoop.dto;

import java.util.Map;

public record EsewaInitiatePaymentResponse(
        String pid,
        String paymentUrl,
        Map<String, String> fields
) {
}

