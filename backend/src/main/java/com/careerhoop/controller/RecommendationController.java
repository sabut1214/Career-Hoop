package com.careerhoop.controller;

import com.careerhoop.dto.CollegeAIRecommendationRequest;
import com.careerhoop.dto.GradeRecommendationRequest;
import com.careerhoop.dto.InterestRecommendationRequest;
import com.careerhoop.dto.RecommendationResponse;
import com.careerhoop.entity.College;
import com.careerhoop.repository.CollegeRepository;
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

    @Autowired
    private PythonRecommendationService pythonRecommendationService;

    @Autowired
    private CollegeRepository collegeRepository;

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
            @RequestParam(value = "limit", defaultValue = "20") Integer limit) {

        // Only use Python service - no fallback
        // First, fetch colleges from database
        List<College> colleges = collegeRepository.findAll();
        
        // Limit to reasonable number for scoring (e.g., top 30 by name)
        if (colleges.size() > 30) {
            colleges = colleges.subList(0, 30);
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

                if (collegeOpt.isEmpty()) continue;
                College c = collegeOpt.get();

                // Only fill missing fields; keep recommender-provided values (e.g. matchScore).
                rec.putIfAbsent("name", c.getName());
                rec.putIfAbsent("location", c.getLocation());
                rec.putIfAbsent("affiliation", c.getAffiliation());
                rec.putIfAbsent("type", c.getType());
                rec.putIfAbsent("overview", c.getOverview());
                rec.putIfAbsent("programs", c.getPrograms());
                rec.putIfAbsent("detailUrl", c.getDetailUrl());
                rec.putIfAbsent("website", c.getWebsite());
                rec.putIfAbsent("students", c.getStudents());
                rec.putIfAbsent("tuition", c.getTuition());
                rec.putIfAbsent("acceptanceRate", c.getAcceptanceRate());
                rec.putIfAbsent("establishedYear", c.getEstablishedYear());
            }

            return ResponseEntity.ok(pythonResponse);
        }

        // Return empty list if Python service is unavailable
        return ResponseEntity.ok(new ArrayList<>());
    }

}

