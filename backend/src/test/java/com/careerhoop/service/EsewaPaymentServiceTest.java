package com.careerhoop.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EsewaPaymentServiceTest {

    @Test
    void parseEsewaVerificationResponse_success() {
        String xml = "<response><response_code>Success</response_code></response>";
        assertTrue(EsewaPaymentService.parseEsewaVerificationResponse(xml));
    }

    @Test
    void parseEsewaVerificationResponse_success_caseInsensitive() {
        String xml = "<response><response_code>success</response_code></response>";
        assertTrue(EsewaPaymentService.parseEsewaVerificationResponse(xml));
    }

    @Test
    void parseEsewaVerificationResponse_failure() {
        String xml = "<response><response_code>Failure</response_code></response>";
        assertFalse(EsewaPaymentService.parseEsewaVerificationResponse(xml));
    }

    @Test
    void parseEsewaVerificationResponse_missingCode() {
        String xml = "<response><foo>bar</foo></response>";
        assertFalse(EsewaPaymentService.parseEsewaVerificationResponse(xml));
    }

    @Test
    void parseEsewaVerificationResponse_rejectsDoctype() {
        String xml = """
                <!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
                <response><response_code>&xxe;</response_code></response>
                """;
        assertFalse(EsewaPaymentService.parseEsewaVerificationResponse(xml));
    }
}

