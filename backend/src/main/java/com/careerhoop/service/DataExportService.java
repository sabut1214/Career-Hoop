package com.careerhoop.service;

import com.careerhoop.dto.SavedCareerResponse;
import com.careerhoop.dto.SavedCollegeResponse;
import com.careerhoop.dto.UserResponse;
import com.careerhoop.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DataExportService {

    private static final Logger logger = LoggerFactory.getLogger(DataExportService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileService userProfileService;

    @Autowired
    private SavedItemsService savedItemsService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Exports all user data as JSON.
     *
     * @param userId The user's ID
     * @return JSON string containing all user data
     * @throws RuntimeException if export fails or data is too large
     */
    public String exportAsJson(UUID userId) {
        try {
            Map<String, Object> exportData = gatherUserData(userId);
            String jsonData = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(exportData);
            
            // Check for extremely large exports (e.g., > 50MB)
            if (jsonData.length() > 50 * 1024 * 1024) {
                logger.warn("Large JSON export detected for user: {} ({} bytes)", userId, jsonData.length());
                throw new RuntimeException("Export data is too large. Please contact support.");
            }
            
            return jsonData;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Failed to export user data as JSON for user: {}", userId, e);
            throw new RuntimeException("Failed to export data as JSON: " + e.getMessage(), e);
        }
    }

    /**
     * Exports all user data as PDF.
     *
     * @param userId The user's ID
     * @return PDF byte array
     * @throws RuntimeException if export fails or data is too large
     */
    public byte[] exportAsPdf(UUID userId) {
        try {
            Map<String, Object> exportData = gatherUserData(userId);
            byte[] pdfData = generatePdf(exportData);
            
            // Check for extremely large PDF exports (e.g., > 100MB)
            if (pdfData.length > 100 * 1024 * 1024) {
                logger.warn("Large PDF export detected for user: {} ({} bytes)", userId, pdfData.length);
                throw new RuntimeException("Export data is too large. Please contact support.");
            }
            
            return pdfData;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Failed to export user data as PDF for user: {}", userId, e);
            throw new RuntimeException("Failed to export data as PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Gathers all user data for export.
     * 
     * @param userId The user's ID (must not be null)
     * @return Map containing all user data for export
     * @throws IllegalArgumentException if user not found
     */
    private Map<String, Object> gatherUserData(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Map<String, Object> data = new HashMap<>();
        
        // Export metadata
        data.put("exportDate", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        data.put("exportVersion", "1.0");

        // User profile
        UserResponse userProfile = userProfileService.getUserProfile(userId);
        data.put("profile", userProfile);

        // Saved careers
        List<SavedCareerResponse> savedCareers = savedItemsService.getSavedCareers(userId);
        data.put("savedCareers", savedCareers);

        // Saved colleges
        List<SavedCollegeResponse> savedColleges = savedItemsService.getSavedColleges(userId);
        data.put("savedColleges", savedColleges);

        return data;
    }

    /**
     * Generates a PDF document from the export data.
     */
    private byte[] generatePdf(Map<String, Object> data) throws IOException {
        PDDocument document = new PDDocument();
        try {
            PdfWriter writer = new PdfWriter(document);
            writer.writePdf(data);
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        } finally {
            document.close();
        }
    }

    /**
     * Helper class to write PDF content with page management.
     */
    private static class PdfWriter {
        private final PDDocument document;
        private PDPageContentStream contentStream;
        private PDPage currentPage;
        private float yPosition = 750;
        private final float margin = 50;
        private final float lineHeight = 20;
        private final float fontSize = 12;

        PdfWriter(PDDocument document) throws IOException {
            this.document = document;
            this.currentPage = new PDPage();
            document.addPage(currentPage);
            this.contentStream = new PDPageContentStream(document, currentPage);
        }

        void writePdf(Map<String, Object> data) throws IOException {
            try {
                writeHeader();
                writeExportDate(data);
                writeProfile(data);
                writeSavedCareers(data);
                writeSavedColleges(data);
            } finally {
                if (contentStream != null) {
                    contentStream.close();
                }
            }
        }

        private void writeHeader() throws IOException {
            contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 16);
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, yPosition);
            contentStream.showText("CareerHoop - User Data Export");
            contentStream.endText();
            yPosition -= 30;
        }

        private void writeExportDate(Map<String, Object> data) throws IOException {
            contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), fontSize);
            String exportDate = (String) data.get("exportDate");
            if (exportDate != null) {
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Export Date: " + exportDate);
                contentStream.endText();
                yPosition -= lineHeight;
            }
            yPosition -= 20;
        }

        private void writeProfile(Map<String, Object> data) throws IOException {
            @SuppressWarnings("unchecked")
            Map<String, Object> profile = (Map<String, Object>) data.get("profile");
            if (profile != null) {
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Profile Information");
                contentStream.endText();
                yPosition -= lineHeight * 1.5f;

                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), fontSize);
                addField("Name", profile.get("name"));
                addField("Email", profile.get("email"));
                addField("Phone", profile.get("phoneNumber"));
                addField("Location", profile.get("location"));
                addField("School", profile.get("schoolName"));
                addField("Date of Birth", profile.get("dateOfBirth"));
                addField("GPA", profile.get("gpa"));
                yPosition -= 20;

                // Academic Details Section
                Object gradeLevel = profile.get("gradeLevel");
                Object stream = profile.get("stream");
                @SuppressWarnings("unchecked")
                List<String> subjects = (List<String>) profile.get("subjects");
                
                if (gradeLevel != null || stream != null || (subjects != null && !subjects.isEmpty())) {
                    contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText("Academic Details");
                    contentStream.endText();
                    yPosition -= lineHeight * 1.5f;

                    contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), fontSize);
                    addField("Grade Level", gradeLevel);
                    addField("Stream", stream);
                    if (subjects != null && !subjects.isEmpty()) {
                        String subjectsStr = String.join(", ", subjects);
                        addField("Subjects", subjectsStr);
                    }
                    yPosition -= 20;
                }

                // Social Links Section
                Object linkedinUrl = profile.get("linkedinUrl");
                Object githubUrl = profile.get("githubUrl");
                Object portfolioUrl = profile.get("portfolioUrl");
                
                if (linkedinUrl != null || githubUrl != null || portfolioUrl != null) {
                    contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(margin, yPosition);
                    contentStream.showText("Social Links");
                    contentStream.endText();
                    yPosition -= lineHeight * 1.5f;

                    contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), fontSize);
                    addField("LinkedIn", linkedinUrl);
                    addField("GitHub", githubUrl);
                    addField("Portfolio", portfolioUrl);
                    yPosition -= 20;
                }
            }
        }

        private void writeSavedCareers(Map<String, Object> data) throws IOException {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> savedCareers = (List<Map<String, Object>>) data.get("savedCareers");
            if (savedCareers != null && !savedCareers.isEmpty()) {
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Saved Careers (" + savedCareers.size() + ")");
                contentStream.endText();
                yPosition -= lineHeight * 1.5f;

                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), fontSize);
                for (Map<String, Object> career : savedCareers) {
                    checkNewPage();
                    addField("Career", career.get("careerName"));
                }
                yPosition -= 20;
            }
        }

        private void writeSavedColleges(Map<String, Object> data) throws IOException {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> savedColleges = (List<Map<String, Object>>) data.get("savedColleges");
            if (savedColleges != null && !savedColleges.isEmpty()) {
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText("Saved Colleges (" + savedColleges.size() + ")");
                contentStream.endText();
                yPosition -= lineHeight * 1.5f;

                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), fontSize);
                for (Map<String, Object> college : savedColleges) {
                    checkNewPage();
                    addField("College", college.get("collegeName"));
                }
            }
        }

        private void checkNewPage() throws IOException {
            if (yPosition < 50) {
                contentStream.close();
                currentPage = new PDPage();
                document.addPage(currentPage);
                contentStream = new PDPageContentStream(document, currentPage);
                yPosition = 750;
            }
        }

        private void addField(String label, Object value) throws IOException {
            checkNewPage();
            String valueStr = value != null ? sanitizePdfText(value.toString()) : "N/A";
            String labelStr = sanitizePdfText(label);
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, yPosition);
            contentStream.showText(labelStr + ": " + valueStr);
            contentStream.endText();
            yPosition -= lineHeight;
        }

        /**
         * Sanitizes text for PDF output to prevent PDF injection attacks.
         * Escapes special characters that have meaning in PDF text objects.
         */
        private String sanitizePdfText(String text) {
            if (text == null) {
                return "";
            }
            // Escape parentheses and backslashes which have special meaning in PDF text
            return text.replace("\\", "\\\\")
                    .replace("(", "\\(")
                    .replace(")", "\\)")
                    .replace("\r", "")
                    .replace("\n", " ");
        }
    }

}

