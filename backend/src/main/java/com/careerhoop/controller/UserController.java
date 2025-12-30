package com.careerhoop.controller;

import com.careerhoop.dto.ChangePasswordRequest;
import com.careerhoop.dto.SaveCareerByNameRequest;
import com.careerhoop.dto.SaveCareerRequest;
import com.careerhoop.dto.SavedCareerResponse;
import com.careerhoop.dto.SavedCollegeResponse;
import com.careerhoop.dto.UpdateUserProfileRequest;
import com.careerhoop.dto.UserResponse;
import com.careerhoop.dto.MeResponse;
import com.careerhoop.service.AuthService;
import com.careerhoop.service.DataExportService;
import com.careerhoop.service.SavedItemsService;
import com.careerhoop.service.UserProfileService;
import com.careerhoop.repository.UserRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @Autowired
    private AuthService authService;

    @Autowired
    private DataExportService dataExportService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UUID userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        int gradeEntryCount = user.getGradeEntryCount() != null ? user.getGradeEntryCount() : 0;

        return ResponseEntity.ok(new MeResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                gradeEntryCount
        ));
    }

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
            @RequestParam(value = "source", required = false) String source,
            @RequestBody UpdateUserProfileRequest request
    ) {
        enforceAccess(id, requesterId, requesterRole);
        UserResponse response = userProfileService.updateUserProfile(id, request, source);
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

    @PostMapping("/{id}/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole,
            @RequestBody ChangePasswordRequest request
    ) {
        enforceAccess(id, requesterId, requesterRole);
        
        // Validate password confirmation
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password and confirmation do not match");
        }
        
        try {
            authService.changePassword(id, request.currentPassword(), request.newPassword());
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping("/{id}/export/json")
    public ResponseEntity<String> exportAsJson(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole
    ) {
        enforceAccess(id, requesterId, requesterRole);
        
        try {
            String jsonData = dataExportService.exportAsJson(id);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setContentDispositionFormData("attachment", "careerhoop-export-" + id + ".json");
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(jsonData);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to export data: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/export/pdf")
    public ResponseEntity<byte[]> exportAsPdf(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Id", required = false) UUID requesterId,
            @RequestHeader(value = "X-User-Role", required = false) String requesterRole
    ) {
        enforceAccess(id, requesterId, requesterRole);
        
        try {
            byte[] pdfData = dataExportService.exportAsPdf(id);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "careerhoop-export-" + id + ".pdf");
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfData);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to export data: " + e.getMessage());
        }
    }

    private void enforceAccess(UUID targetUserId, UUID requesterId, String requesterRole) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
        if (isAdmin) {
            return;
        }

        if (authentication.getPrincipal() instanceof UUID authUserId && authUserId.equals(targetUserId)) {
            return;
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
    }
}
