package com.careerhoop.controller;

import com.careerhoop.entity.Career;
import com.careerhoop.repository.CareerRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/careers")
public class CareerController {

    @Autowired
    private CareerRepository careerRepository;

    @Value("${data.import.path:}")
    private String dataImportPath;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Path resolveDataPath(String filePath) {
        if (dataImportPath != null && !dataImportPath.isEmpty()) {
            return Paths.get(dataImportPath, filePath);
        }
        
        String[] possiblePaths = {
            "../../data",
            "../data",
            "data",
            System.getProperty("user.dir") + "/data"
        };
        
        for (String basePath : possiblePaths) {
            Path fullPath = Paths.get(basePath, filePath);
            if (Files.exists(fullPath)) {
                return fullPath;
            }
        }
        
        return Paths.get(System.getProperty("user.dir"), "data", filePath);
    }

    @GetMapping
    public ResponseEntity<?> getAllCareers() {
        try {
            Path fullPath = resolveDataPath("career/career.json");
            if (!Files.exists(fullPath)) {
                return ResponseEntity.status(404).body(Map.of("error", "Career data file not found: " + fullPath.toAbsolutePath()));
            }
            
            InputStream inputStream = Files.newInputStream(fullPath);
            List<Map<String, Object>> careers = objectMapper.readValue(inputStream, new TypeReference<List<Map<String, Object>>>() {});
            
            // Log the number of careers loaded for debugging
            System.out.println("Loaded " + careers.size() + " careers from: " + fullPath.toAbsolutePath());
            
            return ResponseEntity.ok(careers);
        } catch (Exception e) {
            System.err.println("Error loading careers: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to read career data: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCareerById(@PathVariable String id) {
        try {
            Path fullPath = resolveDataPath("career/career.json");
            if (!Files.exists(fullPath)) {
                return ResponseEntity.status(404).body(Map.of("error", "Career data file not found: " + fullPath.toAbsolutePath()));
            }
            
            InputStream inputStream = Files.newInputStream(fullPath);
            List<Map<String, Object>> careers = objectMapper.readValue(inputStream, new TypeReference<List<Map<String, Object>>>() {});
            
            // Try to match by integer ID first (from JSON file)
            try {
                Integer intId = Integer.parseInt(id);
                Optional<Map<String, Object>> career = careers.stream()
                    .filter(c -> {
                        Object careerId = c.get("id");
                        return careerId != null && careerId.equals(intId);
                    })
                    .findFirst();
                
                if (career.isPresent()) {
                    return ResponseEntity.ok(career.get());
                }
            } catch (NumberFormatException e) {
                // Not an integer ID, might be UUID - fall back to database
            }
            
            // Fall back to database lookup if UUID provided
            try {
                UUID uuid = UUID.fromString(id);
                Optional<Career> career = careerRepository.findById(uuid);
                return career.map(ResponseEntity::ok)
                            .orElse(ResponseEntity.notFound().build());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to read career data: " + e.getMessage()));
        }
    }

    @PostMapping
    public Career createCareer(@RequestBody Career career) {
        return careerRepository.save(career);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Career> updateCareer(@PathVariable UUID id, @RequestBody Career careerDetails) {
        return careerRepository.findById(id)
                .map(career -> {
                    career.setName(careerDetails.getName());
                    career.setDescription(careerDetails.getDescription());
                    career.setOutlook(careerDetails.getOutlook());
                    career.setSalaryRange(careerDetails.getSalaryRange());
                    career.setRequiredSkills(careerDetails.getRequiredSkills());
                    Career updatedCareer = careerRepository.save(career);
                    return ResponseEntity.ok(updatedCareer);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCareer(@PathVariable UUID id) {
        return careerRepository.findById(id)
                .map(career -> {
                    careerRepository.delete(career);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
