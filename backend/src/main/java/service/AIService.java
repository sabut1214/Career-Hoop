package com.careerhoop.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AIService {

    private final RestTemplate restTemplate;

    public AIService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // Your AI service methods will go here
    // For now, we'll keep it empty since we're just setting up the basics
}