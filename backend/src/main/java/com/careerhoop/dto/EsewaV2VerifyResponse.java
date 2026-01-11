package com.careerhoop.dto;

public record EsewaV2VerifyResponse(
        boolean ok,
        String status,
        String transaction_uuid,
        String transaction_code
) {
}
