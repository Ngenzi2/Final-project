package com.examgov.backend.controller;

import com.examgov.backend.dto.response.QrVerifyResponse;
import com.examgov.backend.security.AppUserDetails;
import com.examgov.backend.service.ExamRegistrationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/qr")
public class QrController {

    private final ExamRegistrationService examRegistrationService;

    public QrController(ExamRegistrationService examRegistrationService) {
        this.examRegistrationService = examRegistrationService;
    }

    @GetMapping("/verify")
    @PreAuthorize("hasAnyRole('AUTHORITY', 'EXAM_OFFICER')")
    public QrVerifyResponse verify(@RequestParam String code, @AuthenticationPrincipal AppUserDetails principal) {
        return examRegistrationService.verify(code, principal);
    }
}
