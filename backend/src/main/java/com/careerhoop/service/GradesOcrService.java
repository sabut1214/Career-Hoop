package com.careerhoop.service;

import com.careerhoop.config.OpenAiConfig;
import com.careerhoop.dto.GradeSheetDto;
import com.careerhoop.dto.GradeSubjectDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class GradesOcrService {

    private static final Logger log = LoggerFactory.getLogger(GradesOcrService.class);

    @Autowired
    private OpenAiConfig openAiConfig;

    @Autowired
    private WebClient openAiWebClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public GradeSheetDto extractFromImage(MultipartFile file) {
        try {
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("Only PNG or JPEG images are supported right now.");
            }
            if (!contentType.equals("image/png") && !contentType.equals("image/jpeg") && !contentType.equals("image/jpg")) {
                throw new IllegalArgumentException("Unsupported image type: " + contentType + ". Use PNG or JPEG.");
            }

            // Check if API key is configured
            if (!openAiConfig.isConfigured()) {
                log.error("AI API key is not configured. Please set AI_API_KEY environment variable or ai.api.key in application.properties");
                throw new UnsupportedOperationException(
                        "AI-based grade extraction is not configured. " +
                        "Please set the AI_API_KEY environment variable or configure ai.api.key in application.properties"
                );
            }

            // Convert image to base64
            byte[] imageBytes = file.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            // Determine image format for data URL
            String imageFormat = contentType.equals("image/png") ? "png" : "jpeg";
            String imageDataUrl = "data:image/" + imageFormat + ";base64," + base64Image;

            // Create the prompt for grade extraction
            String systemPrompt = "You are an expert at extracting academic information from marksheets and grade sheets. " +
                    "Extract all relevant information including student name, school/college name, exam name, and all subjects with their grades and marks. " +
                    "Return the data in valid JSON format only, without any markdown formatting or code blocks.";

            String userPrompt = "Extract all academic information from this marksheet image. " +
                    "Return a JSON object with the following structure:\n" +
                    "{\n" +
                    "  \"studentName\": \"student name if visible\",\n" +
                    "  \"schoolName\": \"school or college name if visible\",\n" +
                    "  \"examName\": \"exam name or type (e.g., Class 10, Class 12, Semester 1, etc.) if visible\",\n" +
                    "  \"subjects\": [\n" +
                    "    {\n" +
                    "      \"name\": \"subject name\",\n" +
                    "      \"marks\": numeric_marks_if_available_or_null,\n" +
                    "      \"grade\": \"grade_letter_if_available_or_null\"\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}\n" +
                    "If any field is not visible or cannot be determined, use null for that field. " +
                    "Extract all subjects you can find in the image.";

            // Build the request payload
            Map<String, Object> messageContent = Map.of(
                    "type", "text",
                    "text", userPrompt
            );

            Map<String, Object> imageContent = Map.of(
                    "type", "image_url",
                    "image_url", Map.of("url", imageDataUrl)
            );

            Map<String, Object> message = Map.of(
                    "role", "user",
                    "content", List.of(messageContent, imageContent)
            );

            String modelName = openAiConfig.getModel();
            log.info("Using AI model: {} for grade extraction", modelName);
            log.info("API base URL: {}", openAiConfig.getBaseUrl());
            
            Map<String, Object> requestBody = Map.of(
                    "model", modelName,  // Configurable model from properties: qwen/qwen-2.5-72b-instruct:free
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            message
                    ),
                    "max_tokens", 2000,
                    "response_format", Map.of("type", "json_object")
            );

            log.info("Sending image to OpenRouter API at {} with model {}", openAiConfig.getBaseUrl(), modelName);

            // Make the API call
            @SuppressWarnings("unchecked")
            Map<String, Object> requestBodyTyped = (Map<String, Object>) (Object) requestBody;
            String responseJson = openAiWebClient.post()
                    .uri("/chat/completions")
                    .bodyValue(requestBodyTyped)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (responseJson == null || responseJson.isEmpty()) {
                throw new RuntimeException("Empty response from AI service");
            }

            log.debug("Received response from AI service: {}", responseJson);

            // Parse the response
            JsonNode responseNode = objectMapper.readTree(responseJson);
            JsonNode choices = responseNode.get("choices");
            if (choices == null || !choices.isArray() || choices.size() == 0) {
                throw new RuntimeException("Invalid response format from AI service");
            }

            JsonNode firstChoice = choices.get(0);
            JsonNode messageNode = firstChoice.get("message");
            if (messageNode == null) {
                throw new RuntimeException("Invalid response format from AI service");
            }

            JsonNode contentNode = messageNode.get("content");
            if (contentNode == null || contentNode.isNull()) {
                throw new RuntimeException("No content in AI service response");
            }

            String content = contentNode.asText();
            log.debug("Extracted content from AI response: {}", content);

            // Parse the JSON content into GradeSheetDto
            JsonNode gradeData = objectMapper.readTree(content);
            GradeSheetDto gradeSheet = new GradeSheetDto();

            if (gradeData.has("studentName") && !gradeData.get("studentName").isNull()) {
                gradeSheet.setStudentName(gradeData.get("studentName").asText());
            }

            if (gradeData.has("schoolName") && !gradeData.get("schoolName").isNull()) {
                gradeSheet.setSchoolName(gradeData.get("schoolName").asText());
            }

            if (gradeData.has("examName") && !gradeData.get("examName").isNull()) {
                gradeSheet.setExamName(gradeData.get("examName").asText());
            }

            List<GradeSubjectDto> subjects = new ArrayList<>();
            if (gradeData.has("subjects") && gradeData.get("subjects").isArray()) {
                for (JsonNode subjectNode : gradeData.get("subjects")) {
                    GradeSubjectDto subject = new GradeSubjectDto();

                    if (subjectNode.has("name") && !subjectNode.get("name").isNull()) {
                        subject.setName(subjectNode.get("name").asText());
                    }

                    if (subjectNode.has("marks") && !subjectNode.get("marks").isNull()) {
                        subject.setMarks(subjectNode.get("marks").asInt());
                    }

                    if (subjectNode.has("grade") && !subjectNode.get("grade").isNull()) {
                        subject.setGrade(subjectNode.get("grade").asText());
                    }

                    subjects.add(subject);
                }
            }

            gradeSheet.setSubjects(subjects);

            log.info("Successfully extracted grade information: {} subjects found", subjects.size());
            return gradeSheet;

        } catch (UnsupportedOperationException e) {
            throw e;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to extract grades from image", e);
            throw new RuntimeException("Failed to extract grades from image: " + e.getMessage(), e);
        }
    }
}


