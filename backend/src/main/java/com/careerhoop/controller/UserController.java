package com.careerhoop.controller;

import com.careerhoop.dto.SaveCareerByNameRequest;
import com.careerhoop.dto.SaveCareerRequest;
import com.careerhoop.dto.SavedCareerResponse;
import com.careerhoop.dto.SavedCollegeResponse;
import com.careerhoop.dto.UpdateUserProfileRequest;
import com.careerhoop.dto.UserResponse;
import com.careerhoop.service.SavedItemsService;
import com.careerhoop.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    @Autowired
    private UserProfileService userProfileService;

    @Autowired
    private SavedItemsService savedItemsService;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserProfile(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole
    ) {
        enforceAccess(id, requesterId, requesterRole);
        return ResponseEntity.ok(userProfileService.getUserProfile(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUserProfile(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole,
            @RequestBody UpdateUserProfileRequest request
    ) {
        enforceAccess(id, requesterId, requesterRole);
        UserResponse response = userProfileService.updateUserProfile(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/saved-careers")
    public ResponseEntity<List<SavedCareerResponse>> getSavedCareers(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole
    ) {
        enforceAccess(id, requesterId, requesterRole);
        return ResponseEntity.ok(savedItemsService.getSavedCareers(id));
    }

    @GetMapping("/{id}/saved-colleges")
    public ResponseEntity<List<SavedCollegeResponse>> getSavedColleges(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole
    ) {
        enforceAccess(id, requesterId, requesterRole);
        return ResponseEntity.ok(savedItemsService.getSavedColleges(id));
    }

    @PostMapping("/{id}/saved-careers")
    public ResponseEntity<SavedCareerResponse> saveCareer(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole,
            @RequestBody SaveCareerRequest request
    ) {
        enforceAccess(id, requesterId, requesterRole);
        SavedCareerResponse response = savedItemsService.saveCareer(
                id,
                request.careerId(),
                request.confidenceScore(),
                request.matchReason()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/saved-careers/by-name")
    public ResponseEntity<SavedCareerResponse> saveCareerByName(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole,
            @RequestBody SaveCareerByNameRequest request
    ) {
        enforceAccess(id, requesterId, requesterRole);
        SavedCareerResponse response = savedItemsService.saveCareerByName(
                id,
                request.careerName(),
                request.confidenceScore(),
                request.matchReason()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/saved-colleges")
    public ResponseEntity<SavedCollegeResponse> saveCollege(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole,
            @RequestBody Map<String, UUID> request
    ) {
        enforceAccess(id, requesterId, requesterRole);
        UUID collegeId = request.get("collegeId");
        if (collegeId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "collegeId is required");
        }
        SavedCollegeResponse response = savedItemsService.saveCollege(id, collegeId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/saved-careers/{savedCareerId}")
    public ResponseEntity<Void> unsaveCareer(
            @PathVariable UUID id,
            @PathVariable UUID savedCareerId,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole
    ) {
        enforceAccess(id, requesterId, requesterRole);
        savedItemsService.unsaveCareer(id, savedCareerId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/saved-careers/by-career/{careerId}")
    public ResponseEntity<Void> unsaveCareerByCareerId(
            @PathVariable UUID id,
            @PathVariable UUID careerId,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole
    ) {
        enforceAccess(id, requesterId, requesterRole);
        savedItemsService.unsaveCareerByCareerId(id, careerId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/saved-colleges/{savedCollegeId}")
    public ResponseEntity<Void> unsaveCollege(
            @PathVariable UUID id,
            @PathVariable UUID savedCollegeId,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole
    ) {
        enforceAccess(id, requesterId, requesterRole);
        savedItemsService.unsaveCollege(id, savedCollegeId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/saved-colleges/by-college/{collegeId}")
    public ResponseEntity<Void> unsaveCollegeByCollegeId(
            @PathVariable UUID id,
            @PathVariable UUID collegeId,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole
    ) {
        enforceAccess(id, requesterId, requesterRole);
        savedItemsService.unsaveCollegeByCollegeId(id, collegeId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/saved-careers/check/{careerId}")
    public ResponseEntity<Map<String, Boolean>> checkCareerSaved(
            @PathVariable UUID id,
            @PathVariable UUID careerId,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole
    ) {
        enforceAccess(id, requesterId, requesterRole);
        boolean isSaved = savedItemsService.isCareerSaved(id, careerId);
        return ResponseEntity.ok(Map.of("saved", isSaved));
    }

    @GetMapping("/{id}/saved-colleges/check/{collegeId}")
    public ResponseEntity<Map<String, Boolean>> checkCollegeSaved(
            @PathVariable UUID id,
            @PathVariable UUID collegeId,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole
    ) {
        enforceAccess(id, requesterId, requesterRole);
        boolean isSaved = savedItemsService.isCollegeSaved(id, collegeId);
        return ResponseEntity.ok(Map.of("saved", isSaved));
    }

    private void enforceAccess(UUID targetUserId, UUID requesterId, String requesterRole) {
        if (requesterId == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Missing user context.");
        }

        boolean isAdmin = requesterRole != null && requesterRole.equalsIgnoreCase("admin");
        if (!requesterId.equals(targetUserId) && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to access this profile.");
        }
    }
}


