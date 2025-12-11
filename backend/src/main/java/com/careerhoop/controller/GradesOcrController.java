package com.careerhoop.controller;

import com.careerhoop.dto.GradeSheetDto;
import com.careerhoop.service.GradesOcrService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/grades")
@CrossOrigin
public class GradesOcrController {

    private static final Logger log = LoggerFactory.getLogger(GradesOcrController.class);

    @Autowired
    private GradesOcrService gradesOcrService;


    @PostMapping("/ocr")
    public ResponseEntity<?> extractGrades(@RequestParam("file") MultipartFile file) {
        try {
            GradeSheetDto dto = gradesOcrService.extractFromImage(file);
            return ResponseEntity.ok(dto);
        } catch (Exception ex) {
            log.error("Failed to extract grades from image", ex);
            String rootMessage = ex.getCause() != null && ex.getCause().getMessage() != null
                    ? ex.getCause().getMessage()
                    : ex.getMessage();
            
            // Provide more helpful error messages
            String errorMessage = rootMessage;
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to analyze grade sheet: " + errorMessage));
        }
    }
}


