package com.examgov.backend.controller;

import com.examgov.backend.dto.request.CompanyRegisterRequest;
import com.examgov.backend.dto.request.CompanyUpdateRequest;
import com.examgov.backend.dto.response.CompanyResponse;
import com.examgov.backend.security.AppUserDetails;
import com.examgov.backend.service.CompanyService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public List<CompanyResponse> list(@AuthenticationPrincipal AppUserDetails principal) {
        return companyService.list(principal);
    }

    @GetMapping("/{id}")
    public CompanyResponse get(@PathVariable Long id, @AuthenticationPrincipal AppUserDetails principal) {
        return companyService.get(id, principal);
    }

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('AUTHORITY')")
    public CompanyResponse register(
            @Valid @RequestPart("data") CompanyRegisterRequest data,
            @RequestPart(value = "registrationCertificate", required = false) MultipartFile registrationCertificate,
            @RequestPart(value = "drivingSchoolLicense", required = false) MultipartFile drivingSchoolLicense,
            @RequestPart(value = "taxCertificate", required = false) MultipartFile taxCertificate,
            @RequestPart(value = "logo", required = false) MultipartFile logo) {
        return companyService.register(data, registrationCertificate, drivingSchoolLicense, taxCertificate, logo);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('AUTHORITY')")
    public CompanyResponse approve(@PathVariable Long id) {
        return companyService.approve(id);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY', 'AUTHORITY')")
    public CompanyResponse update(
            @PathVariable Long id, @Valid @RequestBody CompanyUpdateRequest request, @AuthenticationPrincipal AppUserDetails principal) {
        return companyService.update(id, request, principal);
    }

    @PatchMapping(value = "/{id}/documents", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('COMPANY', 'AUTHORITY')")
    public CompanyResponse updateDocuments(
            @PathVariable Long id,
            @RequestPart(value = "registrationCertificate", required = false) MultipartFile registrationCertificate,
            @RequestPart(value = "drivingSchoolLicense", required = false) MultipartFile drivingSchoolLicense,
            @RequestPart(value = "taxCertificate", required = false) MultipartFile taxCertificate,
            @RequestPart(value = "logo", required = false) MultipartFile logo,
            @AuthenticationPrincipal AppUserDetails principal) {
        return companyService.updateDocuments(id, registrationCertificate, drivingSchoolLicense, taxCertificate, logo, principal);
    }
}
