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
import java.util.Map;
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
     * Get college recommendations based on grades using Python service.
     * Returns null if service is unavailable.
     */
    public List<Map<String, Object>> getCollegeRecommendations(
            Double grade10,
            Double grade12,
            String stream,
            List<String> subjects,
            List<com.careerhoop.entity.College> colleges,
            Integer limit) {
        if (!pythonServiceEnabled) {
            log.debug("Python recommendation service is disabled");
            return null;
        }

        try {
            String url = pythonServiceUrl + "/recommend/colleges";

            // Build request body
            var requestBody = new java.util.HashMap<String, Object>();
            
            // Grades section
            var gradesMap = new java.util.HashMap<String, Object>();
            gradesMap.put("grade12", grade12 != null ? grade12 : 70.0);
            if (grade10 != null) {
                gradesMap.put("grade10", grade10);
            }
            gradesMap.put("stream", stream != null ? stream : "general");
            if (subjects != null && !subjects.isEmpty()) {
                gradesMap.put("subjects", subjects);
            }
            requestBody.put("grades", gradesMap);
            
            // Convert colleges to maps
            List<Map<String, Object>> collegesList = new ArrayList<>();
            for (com.careerhoop.entity.College college : colleges) {
                Map<String, Object> collegeMap = new java.util.HashMap<>();
                if (college.getId() != null) {
                    collegeMap.put("id", college.getId().toString());
                }
                if (college.getName() != null) {
                    collegeMap.put("name", college.getName());
                }
                if (college.getLocation() != null) {
                    collegeMap.put("location", college.getLocation());
                }
                if (college.getAffiliation() != null) {
                    collegeMap.put("affiliation", college.getAffiliation());
                }
                if (college.getOverview() != null) {
                    collegeMap.put("overview", college.getOverview());
                }
                if (college.getPrograms() != null) {
                    collegeMap.put("programs", college.getPrograms());
                }
                if (college.getCoursesOffered() != null) {
                    collegeMap.put("coursesOffered", college.getCoursesOffered());
                }
                if (college.getType() != null) {
                    collegeMap.put("type", college.getType());
                }
                if (college.getRating() != null) {
                    collegeMap.put("rating", college.getRating());
                }
                if (college.getFeesRange() != null) {
                    collegeMap.put("feesRange", college.getFeesRange());
                }
                if (college.getWebsite() != null) {
                    collegeMap.put("website", college.getWebsite());
                }
                if (college.getStudents() != null) {
                    collegeMap.put("students", college.getStudents());
                }
                if (college.getTuition() != null) {
                    collegeMap.put("tuition", college.getTuition());
                }
                if (college.getAcceptanceRate() != null) {
                    collegeMap.put("acceptanceRate", college.getAcceptanceRate());
                }
                collegesList.add(collegeMap);
            }
            requestBody.put("colleges", collegesList);
            requestBody.put("limit", limit != null ? limit : 4);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);

            log.debug("Calling Python college recommendation service: {}", url);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseCollegeRecommendationResponse(response.getBody());
            }

            log.warn("Python service returned non-2xx status: {}", response.getStatusCode());
            return null;

        } catch (RestClientException e) {
            log.warn("Failed to call Python college recommendation service: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("Error processing Python college recommendation response", e);
            return null;
        }
    }

    /**
     * Parse JSON response from Python service for college recommendations.
     */
    private List<Map<String, Object>> parseCollegeRecommendationResponse(String jsonResponse) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode recommendationsNode = rootNode.get("recommendations");

            if (recommendationsNode == null || !recommendationsNode.isArray()) {
                log.warn("Invalid response format from Python service: missing recommendations array");
                return new ArrayList<>();
            }

            List<Map<String, Object>> recommendations = new ArrayList<>();
            for (JsonNode collegeNode : recommendationsNode) {
                Map<String, Object> collegeMap = new java.util.HashMap<>();
                
                // Copy all fields from the response
                collegeNode.fields().forEachRemaining(entry -> {
                    JsonNode value = entry.getValue();
                    if (value.isTextual()) {
                        collegeMap.put(entry.getKey(), value.asText());
                    } else if (value.isNumber()) {
                        if (value.isInt()) {
                            collegeMap.put(entry.getKey(), value.asInt());
                        } else {
                            collegeMap.put(entry.getKey(), value.asDouble());
                        }
                    } else if (value.isBoolean()) {
                        collegeMap.put(entry.getKey(), value.asBoolean());
                    } else if (value.isNull()) {
                        collegeMap.put(entry.getKey(), null);
                    }
                });
                
                recommendations.add(collegeMap);
            }

            return recommendations;

        } catch (Exception e) {
            log.error("Error parsing Python college recommendation response", e);
            return new ArrayList<>();
        }
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

