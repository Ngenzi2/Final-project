package com.examgov.backend.dto.request;

import com.examgov.backend.domain.ExamType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record StudentCreateRequest(
                @NotBlank String name,
                @NotBlank String nationalId,
                @NotBlank @Email String email,
                @NotNull ExamType examType) {
}
