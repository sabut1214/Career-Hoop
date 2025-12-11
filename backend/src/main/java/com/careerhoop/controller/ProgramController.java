package com.careerhoop.controller;

import com.careerhoop.entity.Program;
import com.careerhoop.repository.ProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/programs")
public class ProgramController {

    @Autowired
    private ProgramRepository programRepository;

    @GetMapping
    public List<Program> getAllPrograms() {
        return programRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Program> getProgramById(@PathVariable UUID id) {
        Optional<Program> program = programRepository.findById(id);
        return program.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/university/{university}")
    public List<Program> getProgramsByUniversity(@PathVariable String university) {
        return programRepository.findByUniversity(university);
    }

    @PostMapping
    public Program createProgram(@RequestBody Program program) {
        return programRepository.save(program);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Program> updateProgram(@PathVariable UUID id, @RequestBody Program programDetails) {
        return programRepository.findById(id)
                .map(program -> {
                    program.setUniversity(programDetails.getUniversity());
                    program.setProgramName(programDetails.getProgramName());
                    program.setDescription(programDetails.getDescription());
                    program.setDuration(programDetails.getDuration());
                    program.setEligibility(programDetails.getEligibility());
                    program.setFees(programDetails.getFees());
                    program.setProgramUrl(programDetails.getProgramUrl());
                    Program updatedProgram = programRepository.save(program);
                    return ResponseEntity.ok(updatedProgram);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProgram(@PathVariable UUID id) {
        return programRepository.findById(id)
                .map(program -> {
                    programRepository.delete(program);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

