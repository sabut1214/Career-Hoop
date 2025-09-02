package com.careerhoop.controller;

import com.careerhoop.entity.Scholarship;
import com.careerhoop.repository.ScholarshipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/scholarships")
public class ScholarshipController {

    @Autowired
    private ScholarshipRepository scholarshipRepository;

    @GetMapping
    public List<Scholarship> getAllScholarships() {
        return scholarshipRepository.findAll();
    }

    @GetMapping("/active")
    public List<Scholarship> getActiveScholarships() {
        return scholarshipRepository.findByDeadlineAfter(LocalDate.now());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Scholarship> getScholarshipById(@PathVariable UUID id) {
        Optional<Scholarship> scholarship = scholarshipRepository.findById(id);
        return scholarship.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Scholarship createScholarship(@RequestBody Scholarship scholarship) {
        return scholarshipRepository.save(scholarship);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Scholarship> updateScholarship(@PathVariable UUID id, @RequestBody Scholarship scholarshipDetails) {
        return scholarshipRepository.findById(id)
                .map(scholarship -> {
                    scholarship.setName(scholarshipDetails.getName());
                    scholarship.setProvider(scholarshipDetails.getProvider());
                    scholarship.setAmount(scholarshipDetails.getAmount());
                    scholarship.setEligibility(scholarshipDetails.getEligibility());
                    scholarship.setDeadline(scholarshipDetails.getDeadline());
                    scholarship.setApplicationLink(scholarshipDetails.getApplicationLink());
                    Scholarship updatedScholarship = scholarshipRepository.save(scholarship);
                    return ResponseEntity.ok(updatedScholarship);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteScholarship(@PathVariable UUID id) {
        return scholarshipRepository.findById(id)
                .map(scholarship -> {
                    scholarshipRepository.delete(scholarship);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
