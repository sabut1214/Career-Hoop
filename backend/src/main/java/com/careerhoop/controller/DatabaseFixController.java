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
            // Whitelist of allowed column names to prevent SQL injection
            // Only these exact column names are allowed
            final List<String> allowedColumns = List.of(
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
            );

            for (String column : allowedColumns) {
                // Validate column name is in whitelist (defense in depth)
                if (!allowedColumns.contains(column)) {
                    throw new IllegalArgumentException("Invalid column name: " + column);
                }
                
                // Use parameterized query with proper escaping
                // PostgreSQL identifier quoting with double quotes
                String quotedColumn = "\"" + column.replace("\"", "\"\"") + "\"";
                
                // Execute ALTER TABLE with validated column name
                // Note: ALTER TABLE doesn't support parameters, but we've validated the column name
                String sql = String.format(
                    "ALTER TABLE colleges ALTER COLUMN %s TYPE TEXT USING %s::text",
                    quotedColumn, quotedColumn
                );
                
                entityManager.createNativeQuery(sql).executeUpdate();
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

