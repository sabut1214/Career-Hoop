package com.careerhoop.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class OpenAiConfig {

    @Value("${ai.api.key:}")
    private String apiKey = "";

    @Value("${ai.api.base-url:https://openrouter.ai/api/v1}")
    private String baseUrl;

    @Value("${ai.api.http-referer:}")
    private String httpReferer = "";

    @Value("${ai.api.x-title:CareerHoop}")
    private String xTitle = "CareerHoop";

    @Value("${ai.api.model:qwen/qwen-2.5-72b-instruct:free}")
    private String model = "qwen/qwen-2.5-72b-instruct:free";

    @Bean
    public WebClient openAiWebClient() {
        WebClient.Builder builder = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

        if (apiKey != null && !apiKey.isEmpty()) {
            builder.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey);
        }

        // OpenRouter-specific headers (optional but recommended)
        if (httpReferer != null && !httpReferer.isEmpty()) {
            builder.defaultHeader("HTTP-Referer", httpReferer);
        }
        if (xTitle != null && !xTitle.isEmpty()) {
            builder.defaultHeader("X-Title", xTitle);
        }

        return builder.build();
    }

    public String getApiKey() {
        return apiKey;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isEmpty();
    }

    public String getModel() {
        return model;
    }

    public String getBaseUrl() {
        return baseUrl;
    }
}
