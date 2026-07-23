package com.examgov.backend.dto.response;

public record OfficerCreatedResponse(
        Long id,
        String name,
        String email,
        String temporaryPassword) {
}
