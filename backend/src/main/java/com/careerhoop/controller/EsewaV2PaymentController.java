package com.careerhoop.controller;

import com.careerhoop.dto.EsewaV2InitiateRequest;
import com.careerhoop.dto.EsewaV2InitiateResponse;
import com.careerhoop.dto.EsewaV2VerifyRequest;
import com.careerhoop.dto.EsewaV2VerifyResponse;
import com.careerhoop.service.EsewaV2PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments/esewa/v2")
public class EsewaV2PaymentController {

    private final EsewaV2PaymentService esewaV2PaymentService;

    public EsewaV2PaymentController(EsewaV2PaymentService esewaV2PaymentService) {
        this.esewaV2PaymentService = esewaV2PaymentService;
    }

    @PostMapping("/initiate")
    public ResponseEntity<EsewaV2InitiateResponse> initiate(@Valid @RequestBody EsewaV2InitiateRequest request) {
        UUID userId = requireAuthenticatedUserId();
        EsewaV2InitiateResponse response = esewaV2PaymentService.initiate(userId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<EsewaV2VerifyResponse> verify(@Valid @RequestBody EsewaV2VerifyRequest request) {
        // Verification can be public - called from frontend after eSewa redirect
        EsewaV2VerifyResponse response = esewaV2PaymentService.verify(request);
        return ResponseEntity.ok(response);
    }

    private UUID requireAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UUID userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return userId;
    }
}
