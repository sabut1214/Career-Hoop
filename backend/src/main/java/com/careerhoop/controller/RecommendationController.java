package com.careerhoop.controller;

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
            @RequestBody GradeRecommendationRequest request,
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
                colleges,
                limit
        );

        if (pythonResponse != null && !pythonResponse.isEmpty()) {
            return ResponseEntity.ok(pythonResponse);
        }

        // Return empty list if Python service is unavailable
        return ResponseEntity.ok(new ArrayList<>());
    }

}

