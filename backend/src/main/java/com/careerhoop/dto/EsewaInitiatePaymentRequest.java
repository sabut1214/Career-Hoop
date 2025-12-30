package com.careerhoop.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record EsewaInitiatePaymentRequest(
        @NotNull
        @DecimalMin(value = "1.00", inclusive = true, message = "Amount must be at least 1.00")
        @Digits(integer = 8, fraction = 2, message = "Amount must have up to 2 decimal places")
        BigDecimal amount,
        String purpose
        ) {
}

