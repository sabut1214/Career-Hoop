package com.careerhoop.controller;

import com.careerhoop.entity.College;
import com.careerhoop.repository.CollegeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/colleges")
public class CollegeController {

    @Autowired
    private CollegeRepository collegeRepository;

    @GetMapping
    public ResponseEntity<?> getAllColleges(
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "affiliation", required = false) String affiliation,
            @RequestParam(value = "minYear", required = false) Integer minYear,
            @RequestParam(value = "maxYear", required = false) Integer maxYear,
            @RequestParam(value = "program", required = false) String program,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "sortBy", required = false, defaultValue = "name") String sortBy,
            @RequestParam(value = "sortOrder", required = false, defaultValue = "asc") String sortOrder
    ) {
        List<College> colleges;
        
        // Apply filters if any are provided
        if (hasFilters(location, affiliation, minYear, maxYear, program, type)) {
            colleges = collegeRepository.findWithFilters(
                location,
                affiliation,
                minYear,
                maxYear,
                type,
                program
            );
        } else {
            colleges = collegeRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));
        }
        
        List<College> uniqueColleges = deduplicateColleges(colleges);
        
        // Apply sorting
        uniqueColleges = sortColleges(uniqueColleges, sortBy, sortOrder);

        if (page == null || size == null) {
            return ResponseEntity.ok(uniqueColleges);
        }

        int safePage = Math.max(page, 0);
        int safeSize = Math.max(size, 1);
        safeSize = Math.min(safeSize, 50);

        int totalElements = uniqueColleges.size();
        int totalPages = (int) Math.ceil((double) totalElements / safeSize);
        int fromIndex = safePage * safeSize;
        if (fromIndex >= totalElements && totalElements > 0) {
            safePage = Math.max(totalPages - 1, 0);
            fromIndex = safePage * safeSize;
        }
        int toIndex = Math.min(fromIndex + safeSize, totalElements);
        List<College> pageContent = fromIndex >= totalElements ? Collections.emptyList() : uniqueColleges.subList(fromIndex, toIndex);

        Map<String, Object> response = new HashMap<>();
        response.put("content", pageContent);
        response.put("data", pageContent); // Also include 'data' for frontend compatibility
        response.put("page", safePage);
        response.put("size", safeSize);
        response.put("totalPages", totalPages);
        response.put("totalElements", totalElements);
        response.put("hasNext", safePage < totalPages - 1);
        response.put("hasPrevious", safePage > 0);
        
        // Add meta for frontend compatibility
        Map<String, Object> meta = new HashMap<>();
        meta.put("page", safePage);
        meta.put("size", safeSize);
        meta.put("totalPages", totalPages);
        meta.put("totalElements", totalElements);
        response.put("meta", meta);

        return ResponseEntity.ok(response);
    }
    
    private boolean hasFilters(String location, String affiliation, Integer minYear, Integer maxYear, String program, String type) {
        return (location != null && !location.isBlank()) ||
               (affiliation != null && !affiliation.isBlank()) ||
               minYear != null ||
               maxYear != null ||
               (program != null && !program.isBlank()) ||
               (type != null && !type.isBlank());
    }
    
    private List<College> sortColleges(List<College> colleges, String sortBy, String sortOrder) {
        if (colleges == null || colleges.isEmpty()) {
            return colleges;
        }
        
        Comparator<College> comparator = null;
        
        switch (sortBy.toLowerCase()) {
            case "name":
                comparator = Comparator.comparing(c -> c.getName() != null ? c.getName().toLowerCase() : "", 
                    Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
                break;
            case "year":
            case "establishedyear":
                comparator = Comparator.comparing(College::getEstablishedYear, Comparator.nullsLast(Integer::compareTo));
                break;
            case "location":
                comparator = Comparator.comparing(c -> c.getLocation() != null ? c.getLocation().toLowerCase() : "", 
                    Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
                break;
            default:
                comparator = Comparator.comparing(c -> c.getName() != null ? c.getName().toLowerCase() : "", 
                    Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        }
        
        if ("desc".equalsIgnoreCase(sortOrder)) {
            comparator = comparator.reversed();
        }
        
        List<College> sorted = new ArrayList<>(colleges);
        sorted.sort(comparator);
        return sorted;
    }
    
    @GetMapping("/filters/options")
    public ResponseEntity<Map<String, List<String>>> getFilterOptions() {
        Map<String, List<String>> options = new HashMap<>();
        options.put("locations", collegeRepository.findDistinctLocations());
        options.put("affiliations", collegeRepository.findDistinctAffiliations());
        return ResponseEntity.ok(options);
    }

    private List<College> deduplicateColleges(List<College> colleges) {
        if (colleges == null || colleges.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, College> uniqueMap = new LinkedHashMap<>();
        for (College college : colleges) {
            if (college == null) {
                continue;
            }

            String key = null;
            if (college.getDetailUrl() != null && !college.getDetailUrl().isBlank()) {
                key = college.getDetailUrl().trim().toLowerCase();
            } else if (college.getName() != null && !college.getName().isBlank()) {
                key = college.getName().trim().toLowerCase();
            } else if (college.getId() != null) {
                key = college.getId().toString();
            }

            if (key == null) {
                continue;
            }

            uniqueMap.putIfAbsent(key, college);
        }

        return new ArrayList<>(uniqueMap.values());
    }

    @GetMapping("/{id}")
    public ResponseEntity<College> getCollegeById(@PathVariable UUID id) {
        Optional<College> college = collegeRepository.findById(id);
        return college.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public College createCollege(@RequestBody College college) {
        return collegeRepository.save(college);
    }

    @PutMapping("/{id}")
    public ResponseEntity<College> updateCollege(@PathVariable UUID id, @RequestBody College collegeDetails) {
        return collegeRepository.findById(id)
                .map(college -> {
                    college.setName(collegeDetails.getName());
                    college.setLocation(collegeDetails.getLocation());
                    college.setAffiliation(collegeDetails.getAffiliation());
                    college.setEstablishedYear(collegeDetails.getEstablishedYear());
                    college.setContact(collegeDetails.getContact());
                    college.setDetailUrl(collegeDetails.getDetailUrl());
                    college.setOverview(collegeDetails.getOverview());
                    college.setPrograms(collegeDetails.getPrograms());
                    college.setFacilities(collegeDetails.getFacilities());
                    college.setWhyChoose(collegeDetails.getWhyChoose());
                    college.setPrincipalMessage(collegeDetails.getPrincipalMessage());
                    college.setExtraInformation(collegeDetails.getExtraInformation());
                    college.setMapEmbedUrl(collegeDetails.getMapEmbedUrl());
                    college.setType(collegeDetails.getType());
                    college.setRating(collegeDetails.getRating());
                    college.setFeesRange(collegeDetails.getFeesRange());
                    college.setCoursesOffered(collegeDetails.getCoursesOffered());
                    college.setWebsite(collegeDetails.getWebsite());
                    college.setStudents(collegeDetails.getStudents());
                    college.setTuition(collegeDetails.getTuition());
                    college.setAcceptanceRate(collegeDetails.getAcceptanceRate());
                    College updatedCollege = collegeRepository.save(college);
                    return ResponseEntity.ok(updatedCollege);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCollege(@PathVariable UUID id) {
        return collegeRepository.findById(id)
                .map(college -> {
                    collegeRepository.delete(college);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/batch")
    public ResponseEntity<List<College>> getCollegesByIds(@RequestBody List<UUID> collegeIds) {
        if (collegeIds == null || collegeIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<College> colleges = collegeRepository.findAllById(collegeIds);
        return ResponseEntity.ok(colleges);
    }
}
