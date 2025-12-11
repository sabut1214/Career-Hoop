package com.careerhoop.controller;

import com.careerhoop.entity.PopularCollege;
import com.careerhoop.repository.PopularCollegeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/popular-colleges")
public class PopularCollegeController {

    @Autowired
    private PopularCollegeRepository popularCollegeRepository;

    @GetMapping
    public List<PopularCollege> getAllPopularColleges() {
        return popularCollegeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PopularCollege> getPopularCollegeById(@PathVariable UUID id) {
        Optional<PopularCollege> popularCollege = popularCollegeRepository.findById(id);
        return popularCollege.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    public List<PopularCollege> getPopularCollegesByCategory(@PathVariable String category) {
        return popularCollegeRepository.findByCategory(category);
    }

    @GetMapping("/category-slug/{categorySlug}")
    public List<PopularCollege> getPopularCollegesByCategorySlug(@PathVariable String categorySlug) {
        return popularCollegeRepository.findByCategorySlug(categorySlug);
    }

    @GetMapping("/program/{program}")
    public List<PopularCollege> getPopularCollegesByProgram(@PathVariable String program) {
        return popularCollegeRepository.findByProgram(program);
    }

    @PostMapping
    public PopularCollege createPopularCollege(@RequestBody PopularCollege popularCollege) {
        return popularCollegeRepository.save(popularCollege);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PopularCollege> updatePopularCollege(@PathVariable UUID id, @RequestBody PopularCollege popularCollegeDetails) {
        return popularCollegeRepository.findById(id)
                .map(popularCollege -> {
                    popularCollege.setName(popularCollegeDetails.getName());
                    popularCollege.setCategory(popularCollegeDetails.getCategory());
                    popularCollege.setCategorySlug(popularCollegeDetails.getCategorySlug());
                    popularCollege.setProgram(popularCollegeDetails.getProgram());
                    popularCollege.setAffiliation(popularCollegeDetails.getAffiliation());
                    popularCollege.setLocation(popularCollegeDetails.getLocation());
                    popularCollege.setDescription(popularCollegeDetails.getDescription());
                    popularCollege.setDetailUrl(popularCollegeDetails.getDetailUrl());
                    PopularCollege updatedPopularCollege = popularCollegeRepository.save(popularCollege);
                    return ResponseEntity.ok(updatedPopularCollege);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePopularCollege(@PathVariable UUID id) {
        return popularCollegeRepository.findById(id)
                .map(popularCollege -> {
                    popularCollegeRepository.delete(popularCollege);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

