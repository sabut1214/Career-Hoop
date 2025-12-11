package com.careerhoop.repository;

import com.careerhoop.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProgramRepository extends JpaRepository<Program, UUID> {
    List<Program> findByUniversity(String university);
    List<Program> findByProgramNameContainingIgnoreCase(String programName);
}

