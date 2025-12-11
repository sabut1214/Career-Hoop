package com.careerhoop.repository;

import com.careerhoop.dto.WeakAreaDto;
import com.careerhoop.entity.QuizAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, UUID> {

    @Query("""
            SELECT new com.careerhoop.dto.WeakAreaDto(
                qa.question.training.id,
                qa.question.training.title,
                qa.question.questionText,
                COUNT(qa)
            )
            FROM QuizAnswer qa
            WHERE qa.correct = false
            GROUP BY qa.question.training.id, qa.question.training.title, qa.question.questionText
            ORDER BY COUNT(qa) DESC
            """)
    List<WeakAreaDto> findTopWeakAreas();

    @Query("""
            SELECT new com.careerhoop.dto.WeakAreaDto(
                qa.question.training.id,
                qa.question.training.title,
                qa.question.questionText,
                COUNT(qa)
            )
            FROM QuizAnswer qa
            WHERE qa.correct = false
            AND qa.quizSession.userId = :userId
            GROUP BY qa.question.training.id, qa.question.training.title, qa.question.questionText
            ORDER BY COUNT(qa) DESC
            """)
    List<WeakAreaDto> findUserWeakAreas(@Param("userId") UUID userId);
}

