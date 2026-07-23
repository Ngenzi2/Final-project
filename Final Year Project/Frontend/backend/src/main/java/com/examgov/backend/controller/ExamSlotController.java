package com.examgov.backend.controller;

import com.examgov.backend.dto.request.ExamSlotRequest;
import com.examgov.backend.dto.response.ExamRegistrationResponse;
import com.examgov.backend.dto.response.ExamSlotResponse;
import com.examgov.backend.security.AppUserDetails;
import com.examgov.backend.service.ExamRegistrationService;
import com.examgov.backend.service.ExamSlotService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exam-slots")
public class ExamSlotController {

    private final ExamSlotService examSlotService;
    private final ExamRegistrationService examRegistrationService;

    public ExamSlotController(ExamSlotService examSlotService, ExamRegistrationService examRegistrationService) {
        this.examSlotService = examSlotService;
        this.examRegistrationService = examRegistrationService;
    }

    @GetMapping
    public List<ExamSlotResponse> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return examSlotService.list(from, to);
    }

    @GetMapping("/by-date")
    @PreAuthorize("hasAnyRole('AUTHORITY', 'EXAM_OFFICER')")
    public List<ExamSlotResponse> byDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return examSlotService.byDate(date);
    }

    @GetMapping("/{id}")
    public ExamSlotResponse get(@PathVariable Long id) {
        return examSlotService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('AUTHORITY')")
    public ExamSlotResponse create(@Valid @RequestBody ExamSlotRequest request, @AuthenticationPrincipal AppUserDetails principal) {
        return examSlotService.create(request, principal);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('AUTHORITY')")
    public ExamSlotResponse cancel(@PathVariable Long id) {
        return examSlotService.cancel(id);
    }

    @GetMapping("/{id}/registrations")
    @PreAuthorize("hasAnyRole('AUTHORITY', 'EXAM_OFFICER')")
    public List<ExamRegistrationResponse> registrations(@PathVariable Long id) {
        return examRegistrationService.listForSlot(id);
    }
}
