package com.examgov.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CompanyRegisterRequest(
        @NotBlank String name,
        @NotBlank String registrationNumber,
        String tin,
        @NotBlank @Email String email,
        String phone,
        String address,
        String district,
        @NotBlank String adminFullName,
        String adminNationalId,
        String adminPhone,
        @NotBlank @Email String adminEmail,
        String adminPosition,
        @NotBlank String adminPassword) {
}
