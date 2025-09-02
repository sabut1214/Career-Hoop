package com.careerhoop.repository;

import com.careerhoop.entity.Mentor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MentorRepository extends JpaRepository<Mentor, UUID> {
    boolean existsByEmail(String email);
    List<Mentor> findByAvailability(Boolean availability);
}
