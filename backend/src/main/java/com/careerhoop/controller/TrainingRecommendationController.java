package com.careerhoop.controller;

import com.careerhoop.dto.TrainingRecommendationDto;
import com.careerhoop.service.TrainingRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin
public class TrainingRecommendationController {

    @Autowired
    private TrainingRecommendationService trainingRecommendationService;

    @GetMapping("/trainings/user/{userId}")
    public ResponseEntity<List<TrainingRecommendationDto>> getRecommendedTrainings(@PathVariable UUID userId) {
        return ResponseEntity.ok(trainingRecommendationService.getRecommendedTrainings(userId));
    }
}

