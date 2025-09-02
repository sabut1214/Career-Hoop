package com.careerhoop.controller;

import com.careerhoop.entity.AcademicRecord;
import com.careerhoop.entity.Student;
import com.careerhoop.repository.AcademicRecordRepository;
import com.careerhoop.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/academic-records")
public class AcademicRecordController {

    @Autowired
    private AcademicRecordRepository academicRecordRepository;

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public List<AcademicRecord> getAllAcademicRecords() {
        return academicRecordRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcademicRecord> getAcademicRecordById(@PathVariable UUID id) {
        Optional<AcademicRecord> academicRecord = academicRecordRepository.findById(id);
        return academicRecord.map(ResponseEntity::ok)
                           .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    public List<AcademicRecord> getAcademicRecordsByStudent(@PathVariable UUID studentId) {
        return academicRecordRepository.findByStudentId(studentId);
    }

    @PostMapping
    public ResponseEntity<AcademicRecord> createAcademicRecord(@RequestBody AcademicRecord academicRecord) {
        // Verify that the student exists
        Optional<Student> student = studentRepository.findById(academicRecord.getStudent().getId());
        if (student.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        academicRecord.setStudent(student.get());
        AcademicRecord savedRecord = academicRecordRepository.save(academicRecord);
        return ResponseEntity.ok(savedRecord);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AcademicRecord> updateAcademicRecord(@PathVariable UUID id, @RequestBody AcademicRecord recordDetails) {
        return academicRecordRepository.findById(id)
                .map(record -> {
                    record.setSubject(recordDetails.getSubject());
                    record.setMarks(recordDetails.getMarks());
                    record.setGpa(recordDetails.getGpa());
                    AcademicRecord updatedRecord = academicRecordRepository.save(record);
                    return ResponseEntity.ok(updatedRecord);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAcademicRecord(@PathVariable UUID id) {
        return academicRecordRepository.findById(id)
                .map(record -> {
                    academicRecordRepository.delete(record);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
