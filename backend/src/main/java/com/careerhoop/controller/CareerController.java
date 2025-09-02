package com.careerhoop.controller;

import com.careerhoop.entity.Career;
import com.careerhoop.repository.CareerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/careers")
public class CareerController {

    @Autowired
    private CareerRepository careerRepository;

    @GetMapping
    public List<Career> getAllCareers() {
        return careerRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Career> getCareerById(@PathVariable UUID id) {
        Optional<Career> career = careerRepository.findById(id);
        return career.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Career createCareer(@RequestBody Career career) {
        return careerRepository.save(career);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Career> updateCareer(@PathVariable UUID id, @RequestBody Career careerDetails) {
        return careerRepository.findById(id)
                .map(career -> {
                    career.setName(careerDetails.getName());
                    career.setDescription(careerDetails.getDescription());
                    career.setOutlook(careerDetails.getOutlook());
                    career.setSalaryRange(careerDetails.getSalaryRange());
                    career.setRequiredSkills(careerDetails.getRequiredSkills());
                    Career updatedCareer = careerRepository.save(career);
                    return ResponseEntity.ok(updatedCareer);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCareer(@PathVariable UUID id) {
        return careerRepository.findById(id)
                .map(career -> {
                    careerRepository.delete(career);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
