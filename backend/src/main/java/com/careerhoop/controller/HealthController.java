package com.careerhoop.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/health")
    public String healthCheck() {
        return "Backend is running successfully!";
    }

    @GetMapping("/api/health")
    public String apiHealthCheck() {
        return "API is healthy and connected to database";
    }
}
