package com.careerhoop.service;

import com.careerhoop.dto.EsewaV2InitiateRequest;
import com.careerhoop.dto.EsewaV2InitiateResponse;
import com.careerhoop.dto.EsewaV2VerifyRequest;
import com.careerhoop.dto.EsewaV2VerifyResponse;
import com.careerhoop.entity.Payment;
import com.careerhoop.entity.PaymentProvider;
import com.careerhoop.entity.PaymentStatus;
import com.careerhoop.repository.PaymentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class EsewaV2PaymentService {

    private final PaymentRepository paymentRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${esewa.v2.env:uat}")
    private String environment;

    @Value("${esewa.v2.form-url-uat:https://rc-epay.esewa.com.np/api/epay/main/v2/form}")
    private String formUrlUat;

    @Value("${esewa.v2.form-url-prod:https://epay.esewa.com.np/api/epay/main/v2/form}")
    private String formUrlProd;

    @Value("${esewa.v2.status-url-uat:https://uat.esewa.com.np/api/epay/transaction/status/}")
    private String statusUrlUat;

    @Value("${esewa.v2.status-url-prod:https://epay.esewa.com.np/api/epay/transaction/status/}")
    private String statusUrlProd;

    @Value("${esewa.v2.secret-key:}")
    private String secretKey;

    @Value("${esewa.v2.product-code:EPAYTEST}")
    private String productCode;

    @Value("${esewa.v2.success-url:http://localhost:5173/payment/esewa/success}")
    private String successUrl;

    @Value("${esewa.v2.failure-url:http://localhost:5173/payment/esewa/failure}")
    private String failureUrl;

    public EsewaV2PaymentService(PaymentRepository paymentRepository, WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.paymentRepository = paymentRepository;
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    @Transactional
    public EsewaV2InitiateResponse initiate(UUID userId, EsewaV2InitiateRequest request) {
        // Generate transaction UUID
        String transactionUuid = UUID.randomUUID().toString();
        
        // Calculate amounts (all as strings)
        String amount = normalizeAmount(request.amount());
        String taxAmount = "0";
        String serviceCharge = "0";
        String deliveryCharge = "0";
        String totalAmount = normalizeAmount(request.amount()); // amount + tax + service + delivery

        // Create payment record
        Payment payment = new Payment();
        payment.setProvider(PaymentProvider.ESEWA);
        payment.setPid(transactionUuid); // Store transaction_uuid in pid field
        payment.setAmount(request.amount());
        payment.setStatus(PaymentStatus.INITIATED);
        payment.setUserId(userId);
        paymentRepository.save(payment);

        // Build signature message in exact order: total_amount,transaction_uuid,product_code
        String signedFieldNames = "total_amount,transaction_uuid,product_code";
        String message = String.format("total_amount=%s,transaction_uuid=%s,product_code=%s",
                totalAmount, transactionUuid, productCode);

        // Generate signature using HMAC-SHA256 and Base64 encode
        String signature = generateSignature(message, secretKey);

        // Build form fields
        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("amount", amount);
        fields.put("tax_amount", taxAmount);
        fields.put("total_amount", totalAmount);
        fields.put("transaction_uuid", transactionUuid);
        fields.put("product_code", productCode);
        fields.put("product_service_charge", serviceCharge);
        fields.put("product_delivery_charge", deliveryCharge);
        fields.put("success_url", successUrl);
        fields.put("failure_url", failureUrl);
        fields.put("signed_field_names", signedFieldNames);
        fields.put("signature", signature);

        // Determine form URL based on environment
        String actionUrl = "prod".equalsIgnoreCase(environment) ? formUrlProd : formUrlUat;

        return new EsewaV2InitiateResponse(actionUrl, fields);
    }

    @Transactional
    public EsewaV2VerifyResponse verify(EsewaV2VerifyRequest request) {
        try {
            // Decode Base64 data
            byte[] decodedBytes = Base64.getDecoder().decode(request.data());
            String jsonString = new String(decodedBytes, StandardCharsets.UTF_8);
            
            // Parse JSON response
            @SuppressWarnings("unchecked")
            Map<String, Object> response = (Map<String, Object>) objectMapper.readValue(jsonString, Map.class);
            
            // Extract fields
            String transactionUuid = (String) response.get("transaction_uuid");
            String status = (String) response.get("status");
            String signedFieldNames = (String) response.get("signed_field_names");
            String signature = (String) response.get("signature");
            String transactionCode = (String) response.get("transaction_code");
            
            if (transactionUuid == null || signature == null || signedFieldNames == null) {
                return new EsewaV2VerifyResponse(false, "INVALID_RESPONSE", transactionUuid, null);
            }

            // Find payment by transaction_uuid (stored in pid)
            Payment payment = paymentRepository.findByPid(transactionUuid)
                    .orElse(null);
            
            if (payment == null) {
                return new EsewaV2VerifyResponse(false, "PAYMENT_NOT_FOUND", transactionUuid, null);
            }

            // Verify response signature
            boolean signatureValid = verifyResponseSignature(response, signedFieldNames, signature);
            
            if (!signatureValid) {
                payment.setStatus(PaymentStatus.VERIFICATION_FAILED);
                paymentRepository.save(payment);
                return new EsewaV2VerifyResponse(false, "SIGNATURE_INVALID", transactionUuid, transactionCode);
            }

            // If status is COMPLETE, verify with eSewa status API
            if ("COMPLETE".equalsIgnoreCase(status)) {
                boolean statusVerified = verifyWithEsewaStatus(transactionUuid, payment.getAmount());
                
                if (statusVerified) {
                    payment.setStatus(PaymentStatus.SUCCESS);
                    if (transactionCode != null) {
                        payment.setRefId(transactionCode);
                    }
                    paymentRepository.save(payment);
                    return new EsewaV2VerifyResponse(true, "COMPLETE", transactionUuid, transactionCode);
                } else {
                    payment.setStatus(PaymentStatus.VERIFICATION_FAILED);
                    paymentRepository.save(payment);
                    return new EsewaV2VerifyResponse(false, "STATUS_VERIFICATION_FAILED", transactionUuid, transactionCode);
                }
            } else if ("PENDING".equalsIgnoreCase(status)) {
                // Keep as INITIATED, don't update
                return new EsewaV2VerifyResponse(true, "PENDING", transactionUuid, transactionCode);
            } else {
                // CANCELED or other status
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
                return new EsewaV2VerifyResponse(false, status != null ? status.toUpperCase() : "FAILED", transactionUuid, transactionCode);
            }

        } catch (Exception e) {
            return new EsewaV2VerifyResponse(false, "ERROR: " + e.getMessage(), null, null);
        }
    }

    private boolean verifyResponseSignature(Map<String, Object> response, String signedFieldNames, String signature) {
        try {
            // Build message from signed fields in order
            String[] fields = signedFieldNames.split(",");
            StringBuilder messageBuilder = new StringBuilder();
            
            for (int i = 0; i < fields.length; i++) {
                if (i > 0) {
                    messageBuilder.append(",");
                }
                String fieldName = fields[i].trim();
                Object value = response.get(fieldName);
                messageBuilder.append(fieldName).append("=");
                if (value != null) {
                    messageBuilder.append(value.toString());
                }
            }
            
            String message = messageBuilder.toString();
            String expectedSignature = generateSignature(message, secretKey);
            
            // Constant-time comparison
            return MessageDigest.isEqual(
                    expectedSignature.getBytes(StandardCharsets.UTF_8),
                    signature.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            return false;
        }
    }

    private boolean verifyWithEsewaStatus(String transactionUuid, BigDecimal totalAmount) {
        try {
            String statusUrl = "prod".equalsIgnoreCase(environment) ? statusUrlProd : statusUrlUat;
            String amountStr = normalizeAmount(totalAmount);
            
            // Build URL with query parameters
            String url = String.format("%s?product_code=%s&total_amount=%s&transaction_uuid=%s",
                    statusUrl, productCode, amountStr, transactionUuid);

            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response == null || response.isBlank()) {
                return false;
            }

            // Parse JSON response
            @SuppressWarnings("unchecked")
            Map<String, Object> statusResponse = (Map<String, Object>) objectMapper.readValue(response, Map.class);
            Object statusObj = statusResponse.get("status");
            String status = statusObj != null ? String.valueOf(statusObj) : null;
            
            return "COMPLETE".equalsIgnoreCase(status);
        } catch (Exception e) {
            return false;
        }
    }

    private String generateSignature(String message, String secretKey) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate signature", e);
        }
    }

    private static String normalizeAmount(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }
}
