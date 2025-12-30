package com.careerhoop.service;

import com.careerhoop.dto.EsewaInitiatePaymentRequest;
import com.careerhoop.dto.EsewaInitiatePaymentResponse;
import com.careerhoop.entity.Payment;
import com.careerhoop.entity.PaymentProvider;
import com.careerhoop.entity.PaymentStatus;
import com.careerhoop.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class EsewaPaymentService {

    private final PaymentRepository paymentRepository;
    private final WebClient webClient;

    @Value("${esewa.payment-url:https://uat.esewa.com.np/epay/main}")
    private String esewaPaymentUrl;

    @Value("${esewa.verify-url:https://uat.esewa.com.np/epay/transrec}")
    private String esewaVerifyUrl;

    @Value("${esewa.merchant-code:EPAYTEST}")
    private String merchantCode;

    @Value("${esewa.success-callback-url:http://localhost:8080/api/payments/esewa/success}")
    private String successCallbackUrl;

    @Value("${esewa.failure-callback-url:http://localhost:8080/api/payments/esewa/failure}")
    private String failureCallbackUrl;

    public EsewaPaymentService(PaymentRepository paymentRepository, WebClient.Builder webClientBuilder) {
        this.paymentRepository = paymentRepository;
        this.webClient = webClientBuilder.build();
    }

    @Transactional
    public EsewaInitiatePaymentResponse initiate(UUID userId, EsewaInitiatePaymentRequest request) {
        Payment payment = new Payment();
        payment.setProvider(PaymentProvider.ESEWA);
        payment.setPid(generatePid());
        payment.setAmount(request.amount());
        payment.setStatus(PaymentStatus.INITIATED);
        payment.setUserId(userId);
        paymentRepository.save(payment);

        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("amt", normalizeAmount(payment.getAmount()));
        fields.put("psc", "0");
        fields.put("pdc", "0");
        fields.put("txAmt", "0");
        fields.put("tAmt", normalizeAmount(payment.getAmount()));
        fields.put("pid", payment.getPid());
        fields.put("scd", merchantCode);
        fields.put("su", successCallbackUrl);
        fields.put("fu", failureCallbackUrl);

        return new EsewaInitiatePaymentResponse(payment.getPid(), esewaPaymentUrl, fields);
    }

    public Optional<Payment> getByPid(String pid) {
        return paymentRepository.findByPid(pid);
    }

    @Transactional
    public Payment markFailed(String pid) {
        Payment payment = paymentRepository.findByPid(pid)
                .orElseThrow(() -> new IllegalArgumentException("Unknown pid"));
        payment.setStatus(PaymentStatus.FAILED);
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment verifyAndMarkSuccess(String pid, BigDecimal amount, String refId) {
        Payment payment = paymentRepository.findByPid(pid)
                .orElseThrow(() -> new IllegalArgumentException("Unknown pid"));

        boolean verified = verifyWithEsewa(pid, amount, refId);
        payment.setRefId(refId);
        payment.setStatus(verified ? PaymentStatus.SUCCESS : PaymentStatus.VERIFICATION_FAILED);
        Payment saved = paymentRepository.save(payment);

        return saved;
    }

    private boolean verifyWithEsewa(String pid, BigDecimal amount, String refId) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("amt", normalizeAmount(amount));
        form.add("rid", refId);
        form.add("pid", pid);
        form.add("scd", merchantCode);

        String xml = webClient.post()
                .uri(esewaVerifyUrl)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(form))
                .retrieve()
                .bodyToMono(String.class)
                .block();

        if (xml == null || xml.isBlank()) {
            return false;
        }

        return parseEsewaVerificationResponse(xml);
    }

    static boolean parseEsewaVerificationResponse(String xml) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            hardenXmlFactory(factory);
            Document document = factory.newDocumentBuilder()
                    .parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));
            NodeList nodes = document.getElementsByTagName("response_code");
            if (nodes.getLength() == 0) {
                return false;
            }
            String code = nodes.item(0).getTextContent();
            return code != null && code.trim().equalsIgnoreCase("Success");
        } catch (Exception e) {
            return false;
        }
    }

    private static void hardenXmlFactory(DocumentBuilderFactory factory) {
        try {
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        } catch (Exception ignored) {
        }
        try {
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        } catch (Exception ignored) {
        }
        try {
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        } catch (Exception ignored) {
        }
        try {
            factory.setXIncludeAware(false);
        } catch (Exception ignored) {
        }
        try {
            factory.setExpandEntityReferences(false);
        } catch (Exception ignored) {
        }
    }

    private static String generatePid() {
        return "CH-" + UUID.randomUUID();
    }

    private static String normalizeAmount(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }
}
