package com.careerhoop.repository;

import com.careerhoop.entity.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SyllabusRepository extends JpaRepository<Syllabus, UUID> {
    Optional<Syllabus> findByProgramCode(String programCode);
    List<Syllabus> findByProgramNameContainingIgnoreCase(String programName);
}

