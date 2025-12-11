package com.careerhoop.repository;

import com.careerhoop.entity.PopularCollege;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PopularCollegeRepository extends JpaRepository<PopularCollege, UUID> {
    List<PopularCollege> findByCategory(String category);
    List<PopularCollege> findByCategorySlug(String categorySlug);
    List<PopularCollege> findByProgram(String program);
}

