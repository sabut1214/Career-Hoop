package com.careerhoop.controller;

import com.careerhoop.entity.College;
import com.careerhoop.repository.CollegeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/colleges")
public class CollegeController {

    @Autowired
    private CollegeRepository collegeRepository;

    @GetMapping
    public List<College> getAllColleges() {
        return collegeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<College> getCollegeById(@PathVariable UUID id) {
        Optional<College> college = collegeRepository.findById(id);
        return college.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public College createCollege(@RequestBody College college) {
        return collegeRepository.save(college);
    }

    @PutMapping("/{id}")
    public ResponseEntity<College> updateCollege(@PathVariable UUID id, @RequestBody College collegeDetails) {
        return collegeRepository.findById(id)
                .map(college -> {
                    college.setName(collegeDetails.getName());
                    college.setLocation(collegeDetails.getLocation());
                    college.setType(collegeDetails.getType());
                    college.setRating(collegeDetails.getRating());
                    college.setFeesRange(collegeDetails.getFeesRange());
                    college.setCoursesOffered(collegeDetails.getCoursesOffered());
                    college.setWebsite(collegeDetails.getWebsite());
                    College updatedCollege = collegeRepository.save(college);
                    return ResponseEntity.ok(updatedCollege);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCollege(@PathVariable UUID id) {
        return collegeRepository.findById(id)
                .map(college -> {
                    collegeRepository.delete(college);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
