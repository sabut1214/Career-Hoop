package com.careerhoop.controller;

import com.careerhoop.entity.Mentor;
import com.careerhoop.repository.MentorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/mentors")
public class MentorController {

    @Autowired
    private MentorRepository mentorRepository;

    @GetMapping
    public List<Mentor> getAllMentors() {
        return mentorRepository.findAll();
    }

    @GetMapping("/available")
    public List<Mentor> getAvailableMentors() {
        return mentorRepository.findByAvailability(true);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mentor> getMentorById(@PathVariable UUID id) {
        Optional<Mentor> mentor = mentorRepository.findById(id);
        return mentor.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createMentor(@RequestBody Mentor mentor) {
        if (mentorRepository.existsByEmail(mentor.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                               .body("Mentor with this email already exists");
        }
        Mentor savedMentor = mentorRepository.save(mentor);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedMentor);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Mentor> updateMentor(@PathVariable UUID id, @RequestBody Mentor mentorDetails) {
        return mentorRepository.findById(id)
                .map(mentor -> {
                    mentor.setName(mentorDetails.getName());
                    mentor.setEmail(mentorDetails.getEmail());
                    mentor.setExpertiseArea(mentorDetails.getExpertiseArea());
                    mentor.setExperienceYears(mentorDetails.getExperienceYears());
                    mentor.setCompany(mentorDetails.getCompany());
                    mentor.setAvailability(mentorDetails.getAvailability());
                    Mentor updatedMentor = mentorRepository.save(mentor);
                    return ResponseEntity.ok(updatedMentor);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMentor(@PathVariable UUID id) {
        return mentorRepository.findById(id)
                .map(mentor -> {
                    mentorRepository.delete(mentor);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
