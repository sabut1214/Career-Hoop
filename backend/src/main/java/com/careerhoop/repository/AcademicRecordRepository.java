package com.careerhoop.repository;

import com.careerhoop.entity.AcademicRecord;
import com.careerhoop.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AcademicRecordRepository extends JpaRepository<AcademicRecord, UUID> {
    List<AcademicRecord> findByStudent(Student student);
    List<AcademicRecord> findByStudentId(UUID studentId);
}
