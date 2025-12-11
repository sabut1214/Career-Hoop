package com.careerhoop.repository;

import com.careerhoop.entity.SavedCareer;
import com.careerhoop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedCareerRepository extends JpaRepository<SavedCareer, UUID> {
    
    @EntityGraph(attributePaths = {"career", "user"})
    List<SavedCareer> findByUserOrderBySavedAtDesc(User user);
    
    @EntityGraph(attributePaths = {"career", "user"})
    List<SavedCareer> findByUserIdOrderBySavedAtDesc(UUID userId);
    
    Optional<SavedCareer> findByUserAndCareerId(User user, UUID careerId);
    
    boolean existsByUserAndCareerId(User user, UUID careerId);
}

