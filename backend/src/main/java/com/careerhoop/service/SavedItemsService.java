package com.careerhoop.service;

import com.careerhoop.dto.SavedCareerResponse;
import com.careerhoop.dto.SavedCollegeResponse;
import com.careerhoop.entity.*;
import com.careerhoop.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SavedItemsService {

    @Autowired
    private SavedCareerRepository savedCareerRepository;

    @Autowired
    private SavedCollegeRepository savedCollegeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CareerRepository careerRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    public List<SavedCareerResponse> getSavedCareers(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        List<SavedCareer> savedCareers = savedCareerRepository.findByUserOrderBySavedAtDesc(user);
        return savedCareers.stream()
                .map(SavedCareerResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<SavedCollegeResponse> getSavedColleges(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        List<SavedCollege> savedColleges = savedCollegeRepository.findByUserOrderBySavedAtDesc(user);
        return savedColleges.stream()
                .map(SavedCollegeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public SavedCareerResponse saveCareer(UUID userId, UUID careerId, Double confidenceScore, String matchReason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new IllegalArgumentException("Career not found"));

        // Check if already saved
        if (savedCareerRepository.existsByUserAndCareerId(user, careerId)) {
            throw new IllegalArgumentException("Career is already saved");
        }

        SavedCareer savedCareer = new SavedCareer();
        savedCareer.setUser(user);
        savedCareer.setCareer(career);
        savedCareer.setConfidenceScore(confidenceScore);
        savedCareer.setMatchReason(matchReason);

        SavedCareer saved = savedCareerRepository.save(savedCareer);
        return SavedCareerResponse.fromEntity(saved);
    }

    @Transactional
    public SavedCareerResponse saveCareerByName(UUID userId, String careerName, Double confidenceScore, String matchReason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        // Try to find career by name, or create it if it doesn't exist
        Career career = careerRepository.findByName(careerName)
                .orElseGet(() -> {
                    // Create a new career if it doesn't exist in the database
                    Career newCareer = new Career();
                    newCareer.setName(careerName);
                    newCareer.setDescription("Career saved from recommendations");
                    return careerRepository.save(newCareer);
                });

        // Check if already saved
        if (savedCareerRepository.existsByUserAndCareerId(user, career.getId())) {
            throw new IllegalArgumentException("Career is already saved");
        }

        SavedCareer savedCareer = new SavedCareer();
        savedCareer.setUser(user);
        savedCareer.setCareer(career);
        savedCareer.setConfidenceScore(confidenceScore);
        savedCareer.setMatchReason(matchReason);

        SavedCareer saved = savedCareerRepository.save(savedCareer);
        return SavedCareerResponse.fromEntity(saved);
    }

    @Autowired(required = false)
    private NotificationService notificationService;

    @Transactional
    public SavedCollegeResponse saveCollege(UUID userId, UUID collegeId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() -> new IllegalArgumentException("College not found"));

        // Check if already saved
        if (savedCollegeRepository.existsByUserAndCollegeId(user, collegeId)) {
            throw new IllegalArgumentException("College is already saved");
        }

        SavedCollege savedCollege = new SavedCollege();
        savedCollege.setUser(user);
        savedCollege.setCollege(college);

        SavedCollege saved = savedCollegeRepository.save(savedCollege);
        
        // Send notification if service is available
        if (notificationService != null) {
            try {
                notificationService.sendCollegeSavedNotification(user, college);
            } catch (Exception e) {
                // Log but don't fail the save operation
                org.slf4j.LoggerFactory.getLogger(SavedItemsService.class)
                    .warn("Failed to send college saved notification", e);
            }
        }
        
        return SavedCollegeResponse.fromEntity(saved);
    }

    @Transactional
    public void unsaveCareer(UUID userId, UUID savedCareerId) {
        SavedCareer savedCareer = savedCareerRepository.findById(savedCareerId)
                .orElseThrow(() -> new IllegalArgumentException("Saved career not found"));
        
        if (!savedCareer.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to delete this saved career");
        }

        savedCareerRepository.delete(savedCareer);
    }

    @Transactional
    public void unsaveCareerByCareerId(UUID userId, UUID careerId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        SavedCareer savedCareer = savedCareerRepository.findByUserAndCareerId(user, careerId)
                .orElseThrow(() -> new IllegalArgumentException("Career is not saved"));

        savedCareerRepository.delete(savedCareer);
    }

    @Transactional
    public void unsaveCollege(UUID userId, UUID savedCollegeId) {
        SavedCollege savedCollege = savedCollegeRepository.findById(savedCollegeId)
                .orElseThrow(() -> new IllegalArgumentException("Saved college not found"));
        
        if (!savedCollege.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to delete this saved college");
        }

        savedCollegeRepository.delete(savedCollege);
    }

    @Transactional
    public void unsaveCollegeByCollegeId(UUID userId, UUID collegeId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        SavedCollege savedCollege = savedCollegeRepository.findByUserAndCollegeId(user, collegeId)
                .orElseThrow(() -> new IllegalArgumentException("College is not saved"));

        savedCollegeRepository.delete(savedCollege);
    }

    public boolean isCareerSaved(UUID userId, UUID careerId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return savedCareerRepository.existsByUserAndCareerId(user, careerId);
    }

    public boolean isCollegeSaved(UUID userId, UUID collegeId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return savedCollegeRepository.existsByUserAndCollegeId(user, collegeId);
    }
}

