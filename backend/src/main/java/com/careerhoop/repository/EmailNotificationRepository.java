package com.careerhoop.repository;

import com.careerhoop.entity.EmailNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmailNotificationRepository extends JpaRepository<EmailNotification, UUID> {
    List<EmailNotification> findByUserIdOrderBySentAtDesc(UUID userId);
    
    List<EmailNotification> findByUserIdAndTypeOrderBySentAtDesc(UUID userId, String type);
}

