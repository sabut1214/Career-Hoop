package com.careerhoop.dto;

import java.math.BigDecimal;

public record EsewaPaymentStatusResponse(
        String pid,
        BigDecimal amount,
        String status,
        String refId
) {
}

