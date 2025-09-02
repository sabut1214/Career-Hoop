package com.careerhoop.repository;

import com.careerhoop.entity.Scholarship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScholarshipRepository extends JpaRepository<Scholarship, UUID> {
    List<Scholarship> findByDeadlineAfter(LocalDate date);
}
