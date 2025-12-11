package com.careerhoop.service;

import com.careerhoop.dto.CollegeComparisonRequest;
import com.careerhoop.dto.CollegeComparisonResponse;
import com.careerhoop.entity.College;
import com.careerhoop.entity.CollegeComparison;
import com.careerhoop.repository.CollegeComparisonRepository;
import com.careerhoop.repository.CollegeRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class CollegeComparisonService {

    private static final int MAX_COLLEGES = 5;
    private static final int SESSION_EXPIRY_DAYS = 30;

    @Autowired
    private CollegeComparisonRepository comparisonRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public CollegeComparisonResponse createComparison(UUID userId, CollegeComparisonRequest request) {
        if (request.collegeIds() == null || request.collegeIds().isEmpty()) {
            throw new IllegalArgumentException("At least one college ID is required");
        }

        if (request.collegeIds().size() > MAX_COLLEGES) {
            throw new IllegalArgumentException("Maximum " + MAX_COLLEGES + " colleges can be compared");
        }

        // Verify all colleges exist
        List<College> colleges = new ArrayList<>();
        for (UUID collegeId : request.collegeIds()) {
            if (collegeId != null) {
                College college = collegeRepository.findById(collegeId)
                        .orElseThrow(() -> new IllegalArgumentException("College not found: " + collegeId));
                colleges.add(college);
            }
        }

        // Create comparison entity
        CollegeComparison comparison = new CollegeComparison();
        comparison.setUserId(userId);
        try {
            comparison.setCollegeIds(objectMapper.writeValueAsString(request.collegeIds()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize college IDs", e);
        }
        comparison.setExpiresAt(LocalDateTime.now().plusDays(SESSION_EXPIRY_DAYS));

        CollegeComparison saved = comparisonRepository.save(comparison);

        // Build response
        CollegeComparisonResponse response = new CollegeComparisonResponse();
        response.setId(saved.getId());
        response.setUserId(saved.getUserId());
        response.setColleges(colleges);
        response.setCreatedAt(saved.getCreatedAt());
        response.setExpiresAt(saved.getExpiresAt());

        return response;
    }

    public CollegeComparisonResponse getComparison(UUID comparisonId, UUID userId) {
        CollegeComparison comparison = comparisonRepository.findByIdAndUserId(comparisonId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Comparison not found"));

        // Check if expired
        if (comparison.getExpiresAt() != null && comparison.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Comparison session has expired");
        }

        // Parse college IDs and fetch colleges
        List<UUID> collegeIds;
        try {
            collegeIds = objectMapper.readValue(comparison.getCollegeIds(), new TypeReference<List<UUID>>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse college IDs", e);
        }

        List<College> colleges = (collegeIds != null && !collegeIds.isEmpty()) 
            ? collegeRepository.findAllById(collegeIds) 
            : new ArrayList<>();

        CollegeComparisonResponse response = new CollegeComparisonResponse();
        response.setId(comparison.getId());
        response.setUserId(comparison.getUserId());
        response.setColleges(colleges);
        response.setCreatedAt(comparison.getCreatedAt());
        response.setExpiresAt(comparison.getExpiresAt());

        return response;
    }

    public List<CollegeComparisonResponse> getUserComparisons(UUID userId) {
        List<CollegeComparison> comparisons = comparisonRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<CollegeComparisonResponse> responses = new ArrayList<>();

        for (CollegeComparison comparison : comparisons) {
            // Skip expired comparisons
            if (comparison.getExpiresAt() != null && comparison.getExpiresAt().isBefore(LocalDateTime.now())) {
                continue;
            }

            List<UUID> collegeIds;
            try {
                collegeIds = objectMapper.readValue(comparison.getCollegeIds(), new TypeReference<List<UUID>>() {});
            } catch (Exception e) {
                continue; // Skip invalid comparisons
            }

            List<College> colleges = collegeIds != null ? collegeRepository.findAllById(collegeIds) : new ArrayList<>();

            CollegeComparisonResponse response = new CollegeComparisonResponse();
            response.setId(comparison.getId());
            response.setUserId(comparison.getUserId());
            response.setColleges(colleges);
            response.setCreatedAt(comparison.getCreatedAt());
            response.setExpiresAt(comparison.getExpiresAt());

            responses.add(response);
        }

        return responses;
    }

    @Transactional
    public void deleteComparison(UUID comparisonId, UUID userId) {
        comparisonRepository.deleteByUserIdAndId(userId, comparisonId);
    }
}

