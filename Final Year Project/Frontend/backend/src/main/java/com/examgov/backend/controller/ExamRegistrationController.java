package com.examgov.backend.controller;

import com.examgov.backend.dto.request.BookingRequest;
import com.examgov.backend.dto.request.ExamResultRequest;
import com.examgov.backend.dto.response.ExamRegistrationResponse;
import com.examgov.backend.security.AppUserDetails;
import com.examgov.backend.service.ExamRegistrationService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exam-registrations")
public class ExamRegistrationController {

    private final ExamRegistrationService examRegistrationService;

    public ExamRegistrationController(ExamRegistrationService examRegistrationService) {
        this.examRegistrationService = examRegistrationService;
    }

    @GetMapping
    public List<ExamRegistrationResponse> list(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long teacherId,
            @AuthenticationPrincipal AppUserDetails principal) {
        return examRegistrationService.list(principal, studentId, teacherId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COMPANY', 'TEACHER')")
    public ExamRegistrationResponse book(
            @Valid @RequestBody BookingRequest request, @AuthenticationPrincipal AppUserDetails principal) {
        return examRegistrationService.book(request, principal);
    }

    @PatchMapping("/{id}/pay")
    @PreAuthorize("hasRole('AUTHORITY')")
    public ExamRegistrationResponse markPaid(@PathVariable Long id, @AuthenticationPrincipal AppUserDetails principal) {
        return examRegistrationService.markPaid(id, principal);
    }

    @PatchMapping("/{id}/result")
    @PreAuthorize("hasRole('AUTHORITY')")
    public ExamRegistrationResponse setResult(
            @PathVariable Long id, @Valid @RequestBody ExamResultRequest request, @AuthenticationPrincipal AppUserDetails principal) {
        return examRegistrationService.setResult(id, request.result(), principal);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY', 'TEACHER', 'AUTHORITY')")
    public void cancel(@PathVariable Long id, @AuthenticationPrincipal AppUserDetails principal) {
        examRegistrationService.cancel(id, principal);
    }
}
