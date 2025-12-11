package com.careerhoop.controller;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/db-fix")
public class DatabaseFixController {

    @PersistenceContext
    private EntityManager entityManager;

    @PostMapping("/fix-college-columns")
    @Transactional
    public ResponseEntity<Map<String, String>> fixCollegeColumns() {
        Map<String, String> response = new HashMap<>();
        try {
            String[] columns = {
                    "name",
                    "location",
                    "affiliation",
                    "detail_url",
                    "fees_range",
                    "website",
                    "contact",
                    "type",
                    "why_choose",
                    "extra_information",
                    "facilities",
                    "map_embed_url"
            };

            for (String column : columns) {
                String columnReference = "\"" + column + "\"";
                entityManager.createNativeQuery(
                        "ALTER TABLE colleges ALTER COLUMN " + columnReference + " TYPE TEXT USING " + columnReference + "::text"
                ).executeUpdate();
            }
            
            response.put("status", "success");
            response.put("message", "College table columns fixed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to fix columns: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/columns")
    public ResponseEntity<List<Object[]>> getCollegeColumnTypes() {
        @SuppressWarnings("unchecked")
        List<Object[]> results = entityManager.createNativeQuery(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'colleges' ORDER BY column_name"
        ).getResultList();
        return ResponseEntity.ok(results);
    }
}

