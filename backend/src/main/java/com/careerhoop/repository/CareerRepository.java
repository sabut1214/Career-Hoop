package com.careerhoop.repository;

import com.careerhoop.entity.Career;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CareerRepository extends JpaRepository<Career, UUID> {
}
