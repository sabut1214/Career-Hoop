package com.careerhoop.controller;

import com.careerhoop.dto.QuizResultResponse;
import com.careerhoop.dto.QuizSubmitRequest;
import com.careerhoop.dto.StartQuizRequest;
import com.careerhoop.dto.StartQuizResponse;
import com.careerhoop.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin
public class QuizController {

    @Autowired
    private QuizService quizService;

    @PostMapping("/start")
    public ResponseEntity<?> startQuiz(@RequestBody StartQuizRequest request) {
        try {
            StartQuizResponse response = quizService.startQuiz(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitQuiz(@RequestBody QuizSubmitRequest request) {
        try {
            QuizResultResponse response = quizService.submitQuiz(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}

