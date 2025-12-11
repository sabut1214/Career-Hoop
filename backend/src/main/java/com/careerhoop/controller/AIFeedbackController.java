package com.careerhoop.controller;

import com.careerhoop.dto.AIFeedbackDto;
import com.careerhoop.service.AIFeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin
public class AIFeedbackController {

    @Autowired
    private AIFeedbackService aiFeedbackService;

    @GetMapping("/ai/user/{userId}")
    public ResponseEntity<AIFeedbackDto> getAIFeedback(@PathVariable UUID userId) {
        return ResponseEntity.ok(aiFeedbackService.generateFeedback(userId));
    }
}

