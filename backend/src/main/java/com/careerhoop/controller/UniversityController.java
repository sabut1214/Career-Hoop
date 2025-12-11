package com.careerhoop.controller;

import com.careerhoop.entity.University;
import com.careerhoop.repository.UniversityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/universities")
public class UniversityController {

    @Autowired
    private UniversityRepository universityRepository;

    @GetMapping
    public List<University> getAllUniversities() {
        return universityRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<University> getUniversityById(@PathVariable UUID id) {
        Optional<University> university = universityRepository.findById(id);
        return university.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/country/{country}")
    public List<University> getUniversitiesByCountry(@PathVariable String country) {
        return universityRepository.findByCountry(country);
    }

    @PostMapping
    public University createUniversity(@RequestBody University university) {
        return universityRepository.save(university);
    }

    @PutMapping("/{id}")
    public ResponseEntity<University> updateUniversity(@PathVariable UUID id, @RequestBody University universityDetails) {
        return universityRepository.findById(id)
                .map(university -> {
                    university.setName(universityDetails.getName());
                    university.setCountry(universityDetails.getCountry());
                    university.setNumColleges(universityDetails.getNumColleges());
                    university.setNumPrograms(universityDetails.getNumPrograms());
                    university.setDescription(universityDetails.getDescription());
                    university.setProgramsUrl(universityDetails.getProgramsUrl());
                    university.setCollegesUrl(universityDetails.getCollegesUrl());
                    University updatedUniversity = universityRepository.save(university);
                    return ResponseEntity.ok(updatedUniversity);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUniversity(@PathVariable UUID id) {
        return universityRepository.findById(id)
                .map(university -> {
                    universityRepository.delete(university);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

