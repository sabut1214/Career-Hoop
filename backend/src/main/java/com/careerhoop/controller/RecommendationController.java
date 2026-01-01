package com.careerhoop.controller;

import com.careerhoop.dto.CollegeAIRecommendationRequest;
import com.careerhoop.dto.GradeRecommendationRequest;
import com.careerhoop.dto.InterestRecommendationRequest;
import com.careerhoop.dto.RecommendationResponse;
import com.careerhoop.entity.College;
import com.careerhoop.repository.CollegeRepository;
import com.careerhoop.service.CollegeStaticDataService;
import com.careerhoop.service.PythonRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private static boolean isBlankValue(Object value) {
        if (value == null) return true;
        if (!(value instanceof String)) return false;
        return ((String) value).trim().isBlank();
    }

    private static boolean isEmptyPrograms(Object value) {
        if (value == null) return true;
        if (value instanceof List) return ((List<?>) value).isEmpty();
        if (value instanceof String) {
            String trimmed = ((String) value).trim().toLowerCase();
            return trimmed.isBlank() || trimmed.equals("[]") || trimmed.equals("null");
        }
        return false;
    }

    private static boolean isUuidLike(Object value) {
        if (value == null) return false;
        try {
            UUID.fromString(String.valueOf(value).trim());
            return true;
        } catch (IllegalArgumentException ignored) {
            return false;
        }
    }

    @Autowired
    private PythonRecommendationService pythonRecommendationService;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private CollegeStaticDataService collegeStaticDataService;

    @PostMapping("/grades")
    public ResponseEntity<RecommendationResponse> getGradeRecommendations(
            @RequestBody GradeRecommendationRequest request) {

        // Only use Python service - no fallback
        RecommendationResponse pythonResponse = pythonRecommendationService.getRecommendationsByGrades(request);
        if (pythonResponse != null && pythonResponse.recommendations() != null && !pythonResponse.recommendations().isEmpty()) {
            return ResponseEntity.ok(pythonResponse);
        }

        // Return empty recommendations if Python service is unavailable
        return ResponseEntity.ok(new RecommendationResponse(new ArrayList<>()));
    }

    @PostMapping("/interests")
    public ResponseEntity<RecommendationResponse> getInterestRecommendations(
            @RequestBody InterestRecommendationRequest request) {

        // Only use Python service - no fallback
        RecommendationResponse pythonResponse = pythonRecommendationService.getRecommendationsByInterests(request);
        if (pythonResponse != null && pythonResponse.recommendations() != null && !pythonResponse.recommendations().isEmpty()) {
            return ResponseEntity.ok(pythonResponse);
        }

        // Return empty recommendations if Python service is unavailable
        return ResponseEntity.ok(new RecommendationResponse(new ArrayList<>()));
    }

    @PostMapping("/colleges")
    public ResponseEntity<List<Map<String, Object>>> getCollegeRecommendations(
            @RequestBody CollegeAIRecommendationRequest request,
            @RequestParam(value = "limit", defaultValue = "5") Integer limit) {

        // Only use Python service - no fallback
        // First, fetch colleges from database
        List<College> colleges = collegeRepository.findAll();
        
        // Limit to a reasonable number for scoring to avoid very large payloads to the Python service.
        // Too small a candidate set can lead to very few results after filtering on score.
        final int candidateLimit = 250;
        if (colleges.size() > candidateLimit) {
            colleges = colleges.subList(0, candidateLimit);
        }

        // Call Python service
        List<Map<String, Object>> pythonResponse = pythonRecommendationService.getCollegeRecommendations(
                request.grade10(),
                request.grade12(),
                request.stream(),
                request.subjects(),
                request.careerFields(),
                request.activities(),
                request.workEnvironments(),
                colleges,
                limit
        );

        if (pythonResponse != null && !pythonResponse.isEmpty()) {
            // Enrich recommendation results with full DB fields so the frontend can show
            // overview/programs/detailUrl consistently.
            for (Map<String, Object> rec : pythonResponse) {
                if (rec == null) continue;

                Optional<College> collegeOpt = Optional.empty();

                Object idRaw = rec.get("id");
                if (idRaw != null) {
                    try {
                        UUID id = UUID.fromString(String.valueOf(idRaw));
                        collegeOpt = collegeRepository.findById(id);
                    } catch (IllegalArgumentException ignored) {
                        // Non-UUID id (masked or name), fall back to name lookup below.
                    }
                }

                if (collegeOpt.isEmpty()) {
                    Object nameRaw = rec.get("name");
                    if (nameRaw != null) {
                        String name = String.valueOf(nameRaw).trim();
                        if (!name.isBlank()) {
                            collegeOpt = collegeRepository.findFirstByNameIgnoreCase(name);
                        }
                    }
                }

                if (collegeOpt.isEmpty()) {
                    Object nameRaw = rec.get("name");
                    if (nameRaw != null) {
                        String name = String.valueOf(nameRaw).trim();
                        if (!name.isBlank()) {
                            collegeStaticDataService.findByName(name).ifPresent((staticCollege) -> {
                                if (isBlankValue(rec.get("overview"))) {
                                    Object overview = staticCollege.get("overview");
                                    if (!isBlankValue(overview)) rec.put("overview", overview);
                                }

                                if (isEmptyPrograms(rec.get("programs"))) {
                                    Object programs = staticCollege.get("programs");
                                    if (!isEmptyPrograms(programs)) rec.put("programs", programs);
                                }

                                if (isBlankValue(rec.get("detailUrl"))) {
                                    Object detailUrl = staticCollege.getOrDefault("detailUrl", staticCollege.get("detail_url"));
                                    if (!isBlankValue(detailUrl)) rec.put("detailUrl", detailUrl);
                                }

                                if (rec.get("establishedYear") == null) {
                                    Object year = staticCollege.getOrDefault("establishedYear", staticCollege.get("established_year"));
                                    if (year != null) rec.put("establishedYear", year);
                                }

                                if (isBlankValue(rec.get("location"))) {
                                    Object location = staticCollege.get("location");
                                    if (!isBlankValue(location)) rec.put("location", location);
                                }

                                if (isBlankValue(rec.get("affiliation"))) {
                                    Object affiliation = staticCollege.get("affiliation");
                                    if (!isBlankValue(affiliation)) rec.put("affiliation", affiliation);
                                }
                            });
                        }
                    }
                    continue;
                }
                College c = collegeOpt.get();

                // Ensure the frontend gets a stable UUID id for hydration/saving.
                if (!isUuidLike(rec.get("id"))) {
                    rec.put("id", c.getId());
                }

                // Fill missing/empty fields so cards can show Popular Programs and details consistently.
                if (isBlankValue(rec.get("name"))) rec.put("name", c.getName());
                if (isBlankValue(rec.get("location"))) rec.put("location", c.getLocation());
                if (isBlankValue(rec.get("affiliation"))) rec.put("affiliation", c.getAffiliation());
                if (isBlankValue(rec.get("type"))) rec.put("type", c.getType());
                if (isBlankValue(rec.get("overview"))) rec.put("overview", c.getOverview());
                if (isEmptyPrograms(rec.get("programs"))) rec.put("programs", c.getPrograms());
                if (isBlankValue(rec.get("detailUrl"))) rec.put("detailUrl", c.getDetailUrl());
                if (isBlankValue(rec.get("website"))) rec.put("website", c.getWebsite());
                if (rec.get("students") == null) rec.put("students", c.getStudents());
                if (rec.get("tuition") == null) rec.put("tuition", c.getTuition());
                if (rec.get("acceptanceRate") == null) rec.put("acceptanceRate", c.getAcceptanceRate());
                if (rec.get("establishedYear") == null) rec.put("establishedYear", c.getEstablishedYear());

                // Enrich from local JSON catalog (data/colleges/clean.json) when DB fields are missing/empty.
                String lookupName = !isBlankValue(rec.get("name")) ? String.valueOf(rec.get("name")) : c.getName();
                collegeStaticDataService.findByName(lookupName).ifPresent((staticCollege) -> {
                    if (isBlankValue(rec.get("overview"))) {
                        Object overview = staticCollege.get("overview");
                        if (!isBlankValue(overview)) rec.put("overview", overview);
                    }

                    if (isEmptyPrograms(rec.get("programs"))) {
                        Object programs = staticCollege.get("programs");
                        if (!isEmptyPrograms(programs)) rec.put("programs", programs);
                    }

                    if (isBlankValue(rec.get("detailUrl"))) {
                        Object detailUrl = staticCollege.getOrDefault("detailUrl", staticCollege.get("detail_url"));
                        if (!isBlankValue(detailUrl)) rec.put("detailUrl", detailUrl);
                    }

                    if (rec.get("establishedYear") == null) {
                        Object year = staticCollege.getOrDefault("establishedYear", staticCollege.get("established_year"));
                        if (year != null) rec.put("establishedYear", year);
                    }
                });
            }

            return ResponseEntity.ok(pythonResponse);
        }

        // Return empty list if Python service is unavailable
        return ResponseEntity.ok(new ArrayList<>());
    }

}

