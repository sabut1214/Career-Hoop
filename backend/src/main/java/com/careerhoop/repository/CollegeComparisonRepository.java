package com.careerhoop.repository;

import com.careerhoop.entity.CollegeComparison;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollegeComparisonRepository extends JpaRepository<CollegeComparison, UUID> {
    List<CollegeComparison> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    Optional<CollegeComparison> findByIdAndUserId(UUID id, UUID userId);
    
    void deleteByUserIdAndId(UUID userId, UUID id);
}

