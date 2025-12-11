package com.careerhoop.repository;

import com.careerhoop.dto.TrainingQuizStatsDto;
import com.careerhoop.dto.UserQuizHistoryDto;
import com.careerhoop.entity.QuizSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizSessionRepository extends JpaRepository<QuizSession, UUID> {

    Optional<QuizSession> findByIdAndUserId(UUID id, UUID userId);

    @Query("""
            SELECT new com.careerhoop.dto.TrainingQuizStatsDto(
                s.training.id,
                s.training.title,
                COUNT(s),
                COALESCE(AVG(s.score), 0),
                COALESCE(AVG(s.totalQuestions), 0),
                MAX(s.createdAt)
            )
            FROM QuizSession s
            GROUP BY s.training.id, s.training.title
            ORDER BY s.training.title
            """)
    List<TrainingQuizStatsDto> fetchTrainingStats();

    @Query("""
            SELECT new com.careerhoop.dto.TrainingQuizStatsDto(
                s.training.id,
                s.training.title,
                COUNT(s),
                COALESCE(AVG(s.score), 0),
                COALESCE(AVG(s.totalQuestions), 0),
                MAX(s.createdAt)
            )
            FROM QuizSession s
            WHERE s.userId = :userId
            GROUP BY s.training.id, s.training.title
            ORDER BY MAX(s.createdAt) DESC
            """)
    List<TrainingQuizStatsDto> fetchUserTrainingStats(@Param("userId") UUID userId);

    @Query("""
            SELECT new com.careerhoop.dto.UserQuizHistoryDto(
                s.id,
                s.training.id,
                s.training.title,
                s.score,
                s.totalQuestions,
                s.createdAt,
                CASE WHEN s.totalQuestions > 0 THEN (s.score * 100.0 / s.totalQuestions) ELSE 0.0 END
            )
            FROM QuizSession s
            WHERE s.userId = :userId
            ORDER BY s.createdAt DESC
            """)
    List<UserQuizHistoryDto> findUserQuizHistory(@Param("userId") UUID userId);

    @Query("""
            SELECT new com.careerhoop.dto.UserQuizHistoryDto(
                s.id,
                s.training.id,
                s.training.title,
                s.score,
                s.totalQuestions,
                s.createdAt,
                CASE WHEN s.totalQuestions > 0 THEN (s.score * 100.0 / s.totalQuestions) ELSE 0.0 END
            )
            FROM QuizSession s
            WHERE s.userId = :userId
            AND s.createdAt >= :since
            ORDER BY s.createdAt DESC
            """)
    List<UserQuizHistoryDto> findUserQuizHistorySince(@Param("userId") UUID userId, @Param("since") LocalDateTime since);
}
