package com.careerhoop.controller;

import com.careerhoop.entity.Training;
import com.careerhoop.repository.TrainingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/trainings")
@CrossOrigin
public class TrainingController {

    @Autowired
    private TrainingRepository trainingRepository;

    @GetMapping
    public List<Training> getAllTrainings() {
        return trainingRepository.findAll();
    }

    @GetMapping("/available")
    public List<Training> getAvailableTrainings() {
        return trainingRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Training> getTrainingById(@PathVariable UUID id) {
        Optional<Training> training = trainingRepository.findById(id);
        return training.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Training createTraining(@RequestBody Training training) {
        return trainingRepository.save(training);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Training> updateTraining(@PathVariable UUID id, @RequestBody Training trainingDetails) {
        return trainingRepository.findById(id)
                .map(training -> {
                    training.setTitle(trainingDetails.getTitle());
                    training.setDescription(trainingDetails.getDescription());
                    training.setProvider(trainingDetails.getProvider());
                    training.setDuration(trainingDetails.getDuration());
                    training.setLevel(trainingDetails.getLevel());
                    training.setSkills(trainingDetails.getSkills());
                    Training updatedTraining = trainingRepository.save(training);
                    return ResponseEntity.ok(updatedTraining);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTraining(@PathVariable UUID id) {
        return trainingRepository.findById(id)
                .map(training -> {
                    trainingRepository.delete(training);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
