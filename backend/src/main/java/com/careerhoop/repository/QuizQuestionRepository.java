package com.careerhoop.repository;

import com.careerhoop.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, UUID> {

    @Query("select q.id from QuizQuestion q where q.training.id = :trainingId")
    List<UUID> findIdsByTrainingId(@Param("trainingId") UUID trainingId);

    List<QuizQuestion> findByTrainingId(UUID trainingId);
}
