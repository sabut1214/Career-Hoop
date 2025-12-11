package com.careerhoop.service;

import com.careerhoop.dto.CareerRecommendation;
import com.careerhoop.dto.GradeRecommendationRequest;
import com.careerhoop.dto.InterestRecommendationRequest;
import com.careerhoop.dto.RecommendationResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service to communicate with Python ML recommendation service.
 * Provides fallback to existing logic if Python service is unavailable.
 */
@Service
public class PythonRecommendationService {

    private static final Logger log = LoggerFactory.getLogger(PythonRecommendationService.class);

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${python.recommendation.service.url:http://localhost:8000}")
    private String pythonServiceUrl;

    @Value("${python.recommendation.service.enabled:true}")
    private boolean pythonServiceEnabled;

    @Value("${python.recommendation.service.timeout:5000}")
    private int timeoutMs;

    /**
     * Get recommendations based on grades using Python service.
     * Falls back to null if service is unavailable (caller should handle fallback).
     */
    public RecommendationResponse getRecommendationsByGrades(GradeRecommendationRequest request) {
        if (!pythonServiceEnabled) {
            log.debug("Python recommendation service is disabled");
            return null;
        }

        try {
            String url = pythonServiceUrl + "/recommend/grades";

            // Build request body
            var requestBody = new java.util.HashMap<String, Object>();
            requestBody.put("grade12", request.grade12() != null ? request.grade12() : 70.0);
            if (request.grade10() != null) {
                requestBody.put("grade10", request.grade10());
            }
            requestBody.put("stream", request.stream() != null ? request.stream() : "general");
            if (request.subjects() != null && !request.subjects().isEmpty()) {
                requestBody.put("subjects", request.subjects());
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);

            log.debug("Calling Python recommendation service: {}", url);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseRecommendationResponse(response.getBody());
            }

            log.warn("Python service returned non-2xx status: {}", response.getStatusCode());
            return null;

        } catch (RestClientException e) {
            log.warn("Failed to call Python recommendation service: {}. Falling back to default logic.", e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("Error processing Python recommendation response", e);
            return null;
        }
    }

    /**
     * Get recommendations based on interests using Python service.
     * Falls back to null if service is unavailable (caller should handle fallback).
     */
    public RecommendationResponse getRecommendationsByInterests(InterestRecommendationRequest request) {
        if (!pythonServiceEnabled) {
            log.debug("Python recommendation service is disabled");
            return null;
        }

        try {
            String url = pythonServiceUrl + "/recommend/interests";

            // Build request body
            var requestBody = new java.util.HashMap<String, Object>();
            if (request.careerFields() != null) {
                requestBody.put("careerFields", request.careerFields());
            }
            if (request.activities() != null) {
                requestBody.put("activities", request.activities());
            }
            if (request.workEnvironments() != null) {
                requestBody.put("workEnvironments", request.workEnvironments());
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);

            log.debug("Calling Python recommendation service: {}", url);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseRecommendationResponse(response.getBody());
            }

            log.warn("Python service returned non-2xx status: {}", response.getStatusCode());
            return null;

        } catch (RestClientException e) {
            log.warn("Failed to call Python recommendation service: {}. Falling back to default logic.", e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("Error processing Python recommendation response", e);
            return null;
        }
    }

    /**
     * Parse JSON response from Python service into RecommendationResponse DTO.
     */
    private RecommendationResponse parseRecommendationResponse(String jsonResponse) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode recommendationsNode = rootNode.get("recommendations");

            if (recommendationsNode == null || !recommendationsNode.isArray()) {
                log.warn("Invalid response format from Python service: missing recommendations array");
                return null;
            }

            List<CareerRecommendation> recommendations = new ArrayList<>();

            for (JsonNode recNode : recommendationsNode) {
                CareerRecommendation recommendation = new CareerRecommendation(
                        getStringValue(recNode, "id", UUID.randomUUID().toString()),
                        getStringValue(recNode, "title", ""),
                        getStringValue(recNode, "description", ""),
                        getIntValue(recNode, "confidence", 70),
                        getStringValue(recNode, "confidenceLevel", "Medium"),
                        getStringValue(recNode, "matchReason", ""),
                        getStringValue(recNode, "salaryRange", "N/A"),
                        getStringValue(recNode, "jobGrowth", "+10%"),
                        parseStringList(recNode, "skills"),
                        parseStringList(recNode, "opportunities"),
                        getStringValue(recNode, "category", "General")
                );

                recommendations.add(recommendation);
            }

            return new RecommendationResponse(recommendations);

        } catch (Exception e) {
            log.error("Error parsing Python service response", e);
            return null;
        }
    }

    private String getStringValue(JsonNode node, String field, String defaultValue) {
        JsonNode valueNode = node.get(field);
        return (valueNode != null && !valueNode.isNull()) ? valueNode.asText(defaultValue) : defaultValue;
    }

    private int getIntValue(JsonNode node, String field, int defaultValue) {
        JsonNode valueNode = node.get(field);
        return (valueNode != null && !valueNode.isNull()) ? valueNode.asInt(defaultValue) : defaultValue;
    }

    private List<String> parseStringList(JsonNode node, String field) {
        List<String> list = new ArrayList<>();
        JsonNode arrayNode = node.get(field);
        if (arrayNode != null && arrayNode.isArray()) {
            for (JsonNode item : arrayNode) {
                if (item.isTextual()) {
                    list.add(item.asText());
                }
            }
        }
        return list;
    }

    /**
     * Check if Python service is healthy.
     */
    public boolean isHealthy() {
        if (!pythonServiceEnabled) {
            return false;
        }

        try {
            String url = pythonServiceUrl + "/health";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.debug("Python service health check failed: {}", e.getMessage());
            return false;
        }
    }
}

