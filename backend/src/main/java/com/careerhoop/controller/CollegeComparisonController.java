package com.careerhoop.controller;

import com.careerhoop.dto.CollegeComparisonRequest;
import com.careerhoop.dto.CollegeComparisonResponse;
import com.careerhoop.service.CollegeComparisonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/colleges/compare")
@CrossOrigin
public class CollegeComparisonController {

    @Autowired
    private CollegeComparisonService comparisonService;

    @PostMapping
    public ResponseEntity<CollegeComparisonResponse> createComparison(
            @RequestHeader(value = "X-User-Id", required = false) UUID userId,
            @RequestBody CollegeComparisonRequest request
    ) {
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        CollegeComparisonResponse response = comparisonService.createComparison(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{comparisonId}")
    public ResponseEntity<CollegeComparisonResponse> getComparison(
            @PathVariable UUID comparisonId,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId
    ) {
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            CollegeComparisonResponse response = comparisonService.getComparison(comparisonId, userId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CollegeComparisonResponse>> getUserComparisons(
            @PathVariable UUID userId,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole
    ) {
        // Basic access control - user can only see their own comparisons
        if (requesterId == null || !requesterId.equals(userId)) {
            return ResponseEntity.badRequest().build();
        }
        List<CollegeComparisonResponse> responses = comparisonService.getUserComparisons(userId);
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{comparisonId}")
    public ResponseEntity<Void> deleteComparison(
            @PathVariable UUID comparisonId,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId
    ) {
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            comparisonService.deleteComparison(comparisonId, userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

