package com.careerhoop.repository;

import com.careerhoop.entity.SavedCollege;
import com.careerhoop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedCollegeRepository extends JpaRepository<SavedCollege, UUID> {
    
    @EntityGraph(attributePaths = {"college", "user"})
    List<SavedCollege> findByUserOrderBySavedAtDesc(User user);
    
    @EntityGraph(attributePaths = {"college", "user"})
    List<SavedCollege> findByUserIdOrderBySavedAtDesc(UUID userId);
    
    Optional<SavedCollege> findByUserAndCollegeId(User user, UUID collegeId);
    
    boolean existsByUserAndCollegeId(User user, UUID collegeId);
}

