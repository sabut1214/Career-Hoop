package com.careerhoop.repository;

import com.careerhoop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    /**
     * @deprecated Legacy method for token-based password reset.
     * Password reset now uses OtpResetToken entity.
     * TODO: Remove after migration is complete.
     */
    @Deprecated
    Optional<User> findByPasswordResetToken(String token);
}

