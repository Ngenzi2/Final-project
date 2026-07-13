package com.examgov.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record StudentVerifyRequest(@NotBlank String email, @NotBlank String otp) {
}
