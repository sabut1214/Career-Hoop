package com.careerhoop.controller;

import com.careerhoop.dto.QuizAnalyticsResponse;
import com.careerhoop.dto.UserQuizHistoryDto;
import com.careerhoop.service.QuizAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin
public class QuizAnalyticsController {

    @Autowired
    private QuizAnalyticsService quizAnalyticsService;

    @GetMapping("/stats")
    public ResponseEntity<QuizAnalyticsResponse> getQuizStats() {
        return ResponseEntity.ok(quizAnalyticsService.getAnalyticsSummary());
    }

    @GetMapping("/stats/user/{userId}")
    public ResponseEntity<QuizAnalyticsResponse> getUserQuizStats(@PathVariable UUID userId) {
        return ResponseEntity.ok(quizAnalyticsService.getUserAnalytics(userId));
    }

    @GetMapping("/history/user/{userId}")
    public ResponseEntity<List<UserQuizHistoryDto>> getUserQuizHistory(@PathVariable UUID userId) {
        return ResponseEntity.ok(quizAnalyticsService.getUserQuizHistory(userId));
    }

    @GetMapping("/history/user/{userId}/since")
    public ResponseEntity<List<UserQuizHistoryDto>> getUserQuizHistorySince(
            @PathVariable UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since) {
        return ResponseEntity.ok(quizAnalyticsService.getUserQuizHistorySince(userId, since));
    }
}

