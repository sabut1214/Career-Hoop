package com.careerhoop.controller;

import com.careerhoop.entity.Syllabus;
import com.careerhoop.repository.SyllabusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/syllabus")
public class SyllabusController {

    @Autowired
    private SyllabusRepository syllabusRepository;

    @GetMapping
    public List<Syllabus> getAllSyllabus() {
        return syllabusRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Syllabus> getSyllabusById(@PathVariable UUID id) {
        Optional<Syllabus> syllabus = syllabusRepository.findById(id);
        return syllabus.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/program-code/{programCode}")
    public ResponseEntity<Syllabus> getSyllabusByProgramCode(@PathVariable String programCode) {
        Optional<Syllabus> syllabus = syllabusRepository.findByProgramCode(programCode);
        return syllabus.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Syllabus createSyllabus(@RequestBody Syllabus syllabus) {
        return syllabusRepository.save(syllabus);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Syllabus> updateSyllabus(@PathVariable UUID id, @RequestBody Syllabus syllabusDetails) {
        return syllabusRepository.findById(id)
                .map(syllabus -> {
                    syllabus.setProgramCode(syllabusDetails.getProgramCode());
                    syllabus.setProgramName(syllabusDetails.getProgramName());
                    syllabus.setSyllabusUrl(syllabusDetails.getSyllabusUrl());
                    syllabus.setSubjects(syllabusDetails.getSubjects());
                    Syllabus updatedSyllabus = syllabusRepository.save(syllabus);
                    return ResponseEntity.ok(updatedSyllabus);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSyllabus(@PathVariable UUID id) {
        return syllabusRepository.findById(id)
                .map(syllabus -> {
                    syllabusRepository.delete(syllabus);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

