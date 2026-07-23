package com.examgov.backend.controller;

import com.examgov.backend.dto.request.StudentCreateRequest;
import com.examgov.backend.dto.request.StudentVerifyRequest;
import com.examgov.backend.dto.request.TrainingStatusRequest;
import com.examgov.backend.dto.response.BulkImportResponse;
import com.examgov.backend.dto.response.StudentResponse;
import com.examgov.backend.dto.response.StudentVerifyResponse;
import com.examgov.backend.security.AppUserDetails;
import com.examgov.backend.service.StudentService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public List<StudentResponse> list(
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal AppUserDetails principal) {
        return studentService.list(principal, companyId, teacherId, search);
    }

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('TEACHER')")
    public StudentResponse create(
            @Valid @RequestPart("data") StudentCreateRequest data,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            @AuthenticationPrincipal AppUserDetails principal) {
        return studentService.create(data, photo, principal);
    }

    @PatchMapping("/{id}/training-status")
    @PreAuthorize("hasRole('TEACHER')")
    public StudentResponse setTrainingStatus(
            @PathVariable Long id,
            @Valid @RequestBody TrainingStatusRequest request,
            @AuthenticationPrincipal AppUserDetails principal) {
        return studentService.setTrainingStatus(id, request.trainingStatus(), principal);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('COMPANY', 'AUTHORITY')")
    public StudentResponse approve(@PathVariable Long id, @AuthenticationPrincipal AppUserDetails principal) {
        return studentService.approve(id, principal);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('COMPANY', 'AUTHORITY')")
    public StudentResponse reject(@PathVariable Long id, @AuthenticationPrincipal AppUserDetails principal) {
        return studentService.reject(id, principal);
    }

    @PatchMapping("/{id}/resend-verification")
    @PreAuthorize("hasAnyRole('COMPANY', 'AUTHORITY')")
    public StudentResponse resendVerification(@PathVariable Long id,
            @AuthenticationPrincipal AppUserDetails principal) {
        return studentService.resendVerificationOtp(id, principal);
    }

    @PostMapping("/verify")
    public StudentVerifyResponse verify(@Valid @RequestBody StudentVerifyRequest request) {
        return studentService.verifyEmail(request.email(), request.otp());
    }

    @PostMapping(value = "/bulk-import", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('COMPANY')")
    public BulkImportResponse bulkImport(
            @RequestPart("file") MultipartFile file, @AuthenticationPrincipal AppUserDetails principal) {
        return studentService.bulkImport(file, principal);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'COMPANY', 'AUTHORITY')")
    public void delete(@PathVariable Long id, @AuthenticationPrincipal AppUserDetails principal) {
        studentService.delete(id, principal);
    }
}
