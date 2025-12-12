package com.careerhoop.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "refresh_tokens", indexes = {
    @Index(name = "idx_refresh_token_hash", columnList = "token_hash"),
    @Index(name = "idx_refresh_token_user_id", columnList = "user_id"),
    @Index(name = "idx_refresh_token_expires_at", columnList = "expires_at")
})
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "token_hash", nullable = false, unique = true, length = 255)
    private String tokenHash;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "revoked", nullable = false)
    private Boolean revoked = false;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;
}

