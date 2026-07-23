package com.examgov.backend.dto.response;

import java.time.Instant;

public record NotificationResponse(Long id, String title, String message, boolean isRead, Instant createdAt) {
}
