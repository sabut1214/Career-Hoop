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
            @RequestParam(value = "size", required = false) Integer size
    ) {
        List<College> colleges = collegeRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));
        List<College> uniqueColleges = deduplicateColleges(colleges);

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
        response.put("page", safePage);
        response.put("size", safeSize);
        response.put("totalPages", totalPages);
        response.put("totalElements", totalElements);
        response.put("hasNext", safePage < totalPages - 1);
        response.put("hasPrevious", safePage > 0);

        return ResponseEntity.ok(response);
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
}
