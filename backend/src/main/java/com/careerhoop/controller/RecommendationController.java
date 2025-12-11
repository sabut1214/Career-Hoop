package com.careerhoop.controller;

import com.careerhoop.dto.CareerRecommendation;
import com.careerhoop.dto.GradeRecommendationRequest;
import com.careerhoop.dto.InterestRecommendationRequest;
import com.careerhoop.dto.RecommendationResponse;
import com.careerhoop.service.PythonRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private PythonRecommendationService pythonRecommendationService;

    @PostMapping("/grades")
    public ResponseEntity<RecommendationResponse> getGradeRecommendations(
            @RequestBody GradeRecommendationRequest request) {

        // Try Python service first
        RecommendationResponse pythonResponse = pythonRecommendationService.getRecommendationsByGrades(request);
        if (pythonResponse != null && pythonResponse.recommendations() != null && !pythonResponse.recommendations().isEmpty()) {
            return ResponseEntity.ok(pythonResponse);
        }

        // Fallback to existing logic
        double grade12 = request.grade12() != null ? request.grade12() : 70.0;
        double grade10 = request.grade10() != null ? request.grade10() : grade12;
        String stream = request.stream() != null ? request.stream().toLowerCase(Locale.ENGLISH) : "general";

        List<CareerRecommendation> recommendations = new ArrayList<>();

        if (stream.contains("science")) {
            recommendations.add(buildCareer("Software Engineer", "technology", grade12,
                    "Design and develop software applications and systems across platforms.",
                    "Strong science grades and analytical skills align well with software engineering.",
                    "$75,000 - $150,000", "+22%",
                    List.of("Programming", "Problem Solving", "Mathematics", "Systems Design"),
                    List.of("Tech Companies", "Startups", "Remote Work", "Freelancing")));

            recommendations.add(buildCareer("Data Scientist", "data", grade12,
                    "Analyze complex datasets to uncover insights and guide strategic decisions.",
                    "Your performance in quantitative subjects makes data science a strong fit.",
                    "$85,000 - $170,000", "+31%",
                    List.of("Statistics", "Machine Learning", "Data Visualization", "Python"),
                    List.of("Technology", "Finance", "Healthcare", "Research Labs")));
        } else if (stream.contains("management") || stream.contains("commerce")) {
            recommendations.add(buildCareer("Product Manager", "business", grade12,
                    "Lead cross-functional teams to build and launch impactful products.",
                    "Business-focused stream and leadership potential support product management.",
                    "$90,000 - $180,000", "+19%",
                    List.of("Leadership", "Strategy", "Communication", "Market Analysis"),
                    List.of("Tech Companies", "Startups", "Consulting Firms", "Enterprise Teams")));

            recommendations.add(buildCareer("Financial Analyst", "business", grade12,
                    "Evaluate financial data to guide investment and business decisions.",
                    "Strong numbers sense makes you a great fit for financial analysis.",
                    "$70,000 - $140,000", "+6%",
                    List.of("Financial Modeling", "Excel", "Reporting", "Business Acumen"),
                    List.of("Banking", "Corporate Finance", "Consulting", "Investment Firms")));
        } else if (stream.contains("arts") || stream.contains("humanities")) {
            recommendations.add(buildCareer("UX/UI Designer", "design", grade12,
                    "Craft engaging digital experiences through user-centered design.",
                    "Creative strengths and communication skills align with UX/UI design.",
                    "$60,000 - $130,000", "+13%",
                    List.of("Visual Design", "Prototyping", "User Research", "Creative Thinking"),
                    List.of("Product Teams", "Design Agencies", "Startups", "Freelancing")));

            recommendations.add(buildCareer("Content Strategist", "media", grade12,
                    "Develop storytelling and communication strategies for brands.",
                    "Your strength in languages and communication supports content strategy.",
                    "$55,000 - $110,000", "+8%",
                    List.of("Writing", "Brand Storytelling", "Research", "SEO"),
                    List.of("Media", "Marketing Agencies", "Tech Companies", "Publishing")));
        } else {
            recommendations.add(buildCareer("Project Manager", "general", grade12,
                    "Coordinate teams, timelines, and budgets to deliver successful projects.",
                    "Balanced grades show strong organizational potential for project management.",
                    "$70,000 - $135,000", "+6%",
                    List.of("Planning", "Communication", "Risk Management", "Leadership"),
                    List.of("Construction", "Technology", "Consulting", "Operations")));

            recommendations.add(buildCareer("Business Analyst", "business", grade12,
                    "Bridge business goals with technical solutions through analysis.",
                    "Analytical mindset positions you well for business analysis roles.",
                    "$65,000 - $120,000", "+10%",
                    List.of("Process Mapping", "Data Analysis", "Documentation", "Stakeholder Management"),
                    List.of("Enterprise IT", "Consulting", "Finance", "Agencies")));
        }

        // Adjust confidence based on grade differences
        double consistency = Math.abs(grade12 - grade10);
        recommendations = recommendations.stream()
                .map(rec -> adjustConfidence(rec, consistency))
                .toList();

        return ResponseEntity.ok(new RecommendationResponse(recommendations));
    }

    @PostMapping("/interests")
    public ResponseEntity<RecommendationResponse> getInterestRecommendations(
            @RequestBody InterestRecommendationRequest request) {

        // Try Python service first
        RecommendationResponse pythonResponse = pythonRecommendationService.getRecommendationsByInterests(request);
        if (pythonResponse != null && pythonResponse.recommendations() != null && !pythonResponse.recommendations().isEmpty()) {
            return ResponseEntity.ok(pythonResponse);
        }

        // Fallback to existing logic
        List<String> fields = request.careerFields() != null ? request.careerFields() : List.of();
        List<String> activities = request.activities() != null ? request.activities() : List.of();
        List<String> environments = request.workEnvironments() != null ? request.workEnvironments() : List.of();

        List<CareerRecommendation> recommendations = new ArrayList<>();

        if (fields.contains("technology") || activities.contains("Programming")) {
            recommendations.add(buildCareer("Software Engineer", "technology", 90,
                    "Build modern applications and platforms across industries.",
                    "Interest in technology and programming makes software engineering a natural fit.",
                    "$80,000 - $160,000", "+25%",
                    List.of("Programming", "System Design", "APIs", "Testing"),
                    List.of("Tech", "Startups", "Freelance", "Consultancies")));
        }

        if (fields.contains("arts") || activities.contains("Design & Art")) {
            recommendations.add(buildCareer("Creative Director", "design", 82,
                    "Lead design vision and storytelling for brands and campaigns.",
                    "Your passion for art and communication supports creative leadership.",
                    "$70,000 - $150,000", "+11%",
                    List.of("Visual Design", "Concepting", "Leadership", "Communication"),
                    List.of("Agencies", "Studios", "Entertainment", "Product Teams")));
        }

        if (fields.contains("business") || activities.contains("Leadership")) {
            recommendations.add(buildCareer("Product Manager", "business", 84,
                    "Define product strategy and coordinate cross-functional teams.",
                    "Business-minded interests align closely with product leadership roles.",
                    "$95,000 - $185,000", "+19%",
                    List.of("Roadmapping", "Stakeholder Management", "Analytics", "Vision"),
                    List.of("Tech Companies", "Startups", "Enterprise", "Consulting")));
        }

        if (fields.contains("medicine") || environments.contains("Hospital/Clinic")) {
            recommendations.add(buildCareer("Healthcare Administrator", "healthcare", 78,
                    "Oversee operations and strategy within healthcare organizations.",
                    "Your interest in healthcare environments aligns with administration roles.",
                    "$65,000 - $140,000", "+8%",
                    List.of("Operations", "Policy", "Leadership", "Compliance"),
                    List.of("Hospitals", "Clinics", "Public Health", "Non-profits")));
        }

        if (recommendations.isEmpty()) {
            recommendations.add(buildCareer("Career Explorer", "general", 60,
                    "Explore multiple career areas while strengthening transferable skills.",
                    "Start with broad exploration and foundational skills training.",
                    "$45,000 - $95,000", "+5%",
                    List.of("Communication", "Digital Literacy", "Problem Solving", "Networking"),
                    List.of("Entry-level programs", "Internships", "Apprenticeships", "Certificate Programs")));
        }

        return ResponseEntity.ok(new RecommendationResponse(recommendations));
    }

    private CareerRecommendation buildCareer(
            String title,
            String category,
            double gradeScore,
            String description,
            String matchReason,
            String salaryRange,
            String jobGrowth,
            List<String> skills,
            List<String> opportunities) {

        int confidence = (int) Math.min(98, Math.max(60, Math.round(gradeScore)));
        String confidenceLevel = confidence >= 85 ? "High" : confidence >= 70 ? "Medium" : "Low";

        return new CareerRecommendation(
                UUID.randomUUID().toString(),
                title,
                description,
                confidence,
                confidenceLevel,
                matchReason,
                salaryRange,
                jobGrowth,
                skills,
                opportunities,
                category
        );
    }

    private CareerRecommendation adjustConfidence(CareerRecommendation recommendation, double consistency) {
        int adjustedConfidence = recommendation.confidence();
        if (consistency > 15) {
            adjustedConfidence = Math.max(60, adjustedConfidence - 8);
        } else if (consistency < 5) {
            adjustedConfidence = Math.min(98, adjustedConfidence + 5);
        }
        String confidenceLevel = adjustedConfidence >= 85 ? "High" : adjustedConfidence >= 70 ? "Medium" : "Low";
        return new CareerRecommendation(
                recommendation.id(),
                recommendation.title(),
                recommendation.description(),
                adjustedConfidence,
                confidenceLevel,
                recommendation.matchReason(),
                recommendation.salaryRange(),
                recommendation.jobGrowth(),
                recommendation.skills(),
                recommendation.opportunities(),
                recommendation.category()
        );
    }
}

