package com.examgov.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CompanyUpdateRequest(
        @NotBlank @Email String email, String phone, String address, String district) {
}
