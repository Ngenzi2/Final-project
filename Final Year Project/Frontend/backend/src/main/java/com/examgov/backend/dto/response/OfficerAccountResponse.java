package com.examgov.backend.dto.response;

import java.time.Instant;

public record OfficerAccountResponse(
        Long id,
        String name,
        String email,
        boolean enabled,
        Instant createdAt) {
}
