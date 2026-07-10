package com.examgov.backend.dto.response;

import com.examgov.backend.domain.Role;

public record UserResponse(
        Long id,
        String email,
        Role role,
        String name,
        Long companyId,
        Long teacherId,
        Long studentId) {
}
