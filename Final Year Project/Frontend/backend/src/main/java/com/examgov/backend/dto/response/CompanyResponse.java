package com.examgov.backend.dto.response;

import java.time.LocalDate;

public record CompanyResponse(
        Long id,
        String name,
        String registrationNumber,
        String tin,
        String email,
        String phone,
        String address,
        String district,
        Documents documents,
        Admin admin,
        boolean approved,
        LocalDate registrationDate,
        LocalDate approvalDate) {

    public record Documents(
            String registrationCertificateUrl,
            String drivingSchoolLicenseUrl,
            String taxCertificateUrl,
            String logoUrl) {
    }

    public record Admin(
            String fullName, String nationalId, String phone, String email, String position) {
    }
}
