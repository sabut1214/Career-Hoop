package com.careerhoop.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
public class CollegeStaticDataService {

    private final ObjectMapper objectMapper;
    private volatile Map<String, Map<String, Object>> byNormalizedName;

    public CollegeStaticDataService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public Optional<Map<String, Object>> findByName(String name) {
        if (name == null || name.trim().isBlank()) return Optional.empty();
        ensureLoaded();
        return Optional.ofNullable(byNormalizedName.get(normalizeName(name)));
    }

    private void ensureLoaded() {
        if (byNormalizedName != null) return;
        synchronized (this) {
            if (byNormalizedName != null) return;
            byNormalizedName = loadIndex();
        }
    }

    private Map<String, Map<String, Object>> loadIndex() {
        Path cleanPath = resolveCleanJsonPath();
        if (cleanPath == null) return Collections.emptyMap();

        try {
            String json = Files.readString(cleanPath);
            List<Map<String, Object>> items = objectMapper.readValue(json, new TypeReference<>() {});
            Map<String, Map<String, Object>> index = new HashMap<>();
            for (Map<String, Object> item : items) {
                if (item == null) continue;
                Object nameRaw = item.get("name");
                if (nameRaw == null) continue;
                String name = String.valueOf(nameRaw).trim();
                if (name.isBlank()) continue;
                index.put(normalizeName(name), item);
            }
            return Collections.unmodifiableMap(index);
        } catch (IOException e) {
            return Collections.emptyMap();
        }
    }

    private static Path resolveCleanJsonPath() {
        Path direct = Paths.get("data", "colleges", "clean.json");
        if (Files.exists(direct)) return direct;

        // Common when the backend runs with cwd = repoRoot/backend
        Path parent = Paths.get("..", "data", "colleges", "clean.json").normalize();
        if (Files.exists(parent)) return parent;

        String userDir = System.getProperty("user.dir");
        if (userDir != null && !userDir.isBlank()) {
            Path fromUserDir = Paths.get(userDir, "data", "colleges", "clean.json");
            if (Files.exists(fromUserDir)) return fromUserDir;

            Path fromUserDirParent = Paths.get(userDir).resolve("..").resolve("data").resolve("colleges").resolve("clean.json").normalize();
            if (Files.exists(fromUserDirParent)) return fromUserDirParent;
        }

        return null;
    }

    private static String normalizeName(String name) {
        String lower = name.trim().toLowerCase(Locale.ROOT);
        lower = lower.replace('&', ' ');
        lower = lower.replaceAll("[^a-z0-9]+", " ");
        return lower.replaceAll("\\s+", " ").trim();
    }
}
