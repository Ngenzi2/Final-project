package com.examgov.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record TeacherCreateRequest(
        @NotBlank String name, @NotBlank @Email String email, @NotBlank String password) {
}
