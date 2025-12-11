package com.careerhoop.controller;

import com.careerhoop.service.DataImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/data-import")
public class DataImportController {

    @Autowired
    private DataImportService dataImportService;

    @PostMapping("/colleges")
    public ResponseEntity<Map<String, String>> importColleges() {
        Map<String, String> response = new HashMap<>();
        try {
            dataImportService.importColleges("colleges/clean.json");
            response.put("status", "success");
            response.put("message", "Colleges imported successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to import colleges: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/programs")
    public ResponseEntity<Map<String, String>> importPrograms() {
        Map<String, String> response = new HashMap<>();
        try {
            dataImportService.importPrograms("programs/clean.json");
            response.put("status", "success");
            response.put("message", "Programs imported successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to import programs: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/universities")
    public ResponseEntity<Map<String, String>> importUniversities() {
        Map<String, String> response = new HashMap<>();
        try {
            dataImportService.importUniversities("universities/clean.json");
            response.put("status", "success");
            response.put("message", "Universities imported successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to import universities: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/popular-colleges")
    public ResponseEntity<Map<String, String>> importPopularColleges() {
        Map<String, String> response = new HashMap<>();
        try {
            dataImportService.importPopularColleges("popular_colleges/clean.json");
            response.put("status", "success");
            response.put("message", "Popular colleges imported successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to import popular colleges: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/syllabus")
    public ResponseEntity<Map<String, String>> importSyllabus() {
        Map<String, String> response = new HashMap<>();
        try {
            dataImportService.importSyllabus("syllabus/clean.json");
            response.put("status", "success");
            response.put("message", "Syllabus imported successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to import syllabus: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/careers")
    public ResponseEntity<Map<String, String>> importCareers() {
        Map<String, String> response = new HashMap<>();
        try {
            dataImportService.importCareers("career/career.json");
            response.put("status", "success");
            response.put("message", "Careers imported successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to import careers: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/all")
    public ResponseEntity<Map<String, String>> importAll() {
        Map<String, String> response = new HashMap<>();
        try {
            dataImportService.importColleges("colleges/clean.json");
            dataImportService.importPrograms("programs/clean.json");
            dataImportService.importUniversities("universities/clean.json");
            dataImportService.importSyllabus("syllabus/clean.json");
            dataImportService.importPopularColleges("popular_colleges/clean.json");
            dataImportService.importCareers("career/career.json");
            response.put("status", "success");
            response.put("message", "All data imported successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to import data: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}

