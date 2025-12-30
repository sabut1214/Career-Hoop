package com.careerhoop.controller;

import com.careerhoop.dto.EsewaInitiatePaymentRequest;
import com.careerhoop.dto.EsewaInitiatePaymentResponse;
import com.careerhoop.dto.EsewaPaymentStatusResponse;
import com.careerhoop.entity.Payment;
import com.careerhoop.service.EsewaPaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments/esewa")
public class EsewaPaymentController {

    private final EsewaPaymentService esewaPaymentService;

    @Value("${esewa.frontend-return-url:http://localhost:5173/payment/esewa/return}")
    private String frontendReturnUrl;

    public EsewaPaymentController(EsewaPaymentService esewaPaymentService) {
        this.esewaPaymentService = esewaPaymentService;
    }

    @PostMapping("/initiate")
    public EsewaInitiatePaymentResponse initiate(@Valid @RequestBody EsewaInitiatePaymentRequest request) {
        UUID userId = requireAuthenticatedUserId();
        return esewaPaymentService.initiate(userId, request);
    }

    @GetMapping("/status")
    public EsewaPaymentStatusResponse status(@RequestParam("pid") String pid) {
        requireAuthenticatedUserId();
        Payment payment = esewaPaymentService.getByPid(pid)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        return new EsewaPaymentStatusResponse(payment.getPid(), payment.getAmount(), payment.getStatus().name(), payment.getRefId());
    }

    @GetMapping("/success")
    public ResponseEntity<Void> success(
            @RequestParam Map<String, String> params
    ) {
        String pid = firstNonBlank(params.get("oid"), params.get("pid"));
        String refId = firstNonBlank(params.get("refId"), params.get("ref_id"), params.get("refid"));
        BigDecimal amount = parseAmount(firstNonBlank(params.get("amt"), params.get("amount")));

        if (pid == null || refId == null || amount == null) {
            return redirectToFrontend("failed", pid, "missing_params");
        }

        try {
            Payment payment = esewaPaymentService.verifyAndMarkSuccess(pid, amount, refId);
            if ("SUCCESS".equals(payment.getStatus().name())) {
                return redirectToFrontend("success", pid, null);
            }
            return redirectToFrontend("failed", pid, "verification_failed");
        } catch (Exception e) {
            return redirectToFrontend("failed", pid, "server_error");
        }
    }

    @GetMapping("/failure")
    public ResponseEntity<Void> failure(@RequestParam Map<String, String> params) {
        String pid = firstNonBlank(params.get("oid"), params.get("pid"));
        if (pid != null) {
            try {
                esewaPaymentService.markFailed(pid);
            } catch (Exception ignored) {
            }
        }
        return redirectToFrontend("failed", pid, "gateway_failed");
    }

    private UUID requireAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UUID userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return userId;
    }

    private ResponseEntity<Void> redirectToFrontend(String status, String pid, String reason) {
        StringBuilder url = new StringBuilder(frontendReturnUrl);
        if (!frontendReturnUrl.contains("?")) {
            url.append("?");
        } else if (!frontendReturnUrl.endsWith("&") && !frontendReturnUrl.endsWith("?")) {
            url.append("&");
        }
        url.append("status=").append(encode(status));
        if (pid != null) {
            url.append("&pid=").append(encode(pid));
        }
        if (reason != null) {
            url.append("&reason=").append(encode(reason));
        }
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, URI.create(url.toString()).toString())
                .build();
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private static String firstNonBlank(String... values) {
        if (values == null) return null;
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private static BigDecimal parseAmount(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return new BigDecimal(value.trim());
        } catch (Exception e) {
            return null;
        }
    }
}

