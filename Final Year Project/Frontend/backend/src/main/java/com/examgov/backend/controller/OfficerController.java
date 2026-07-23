package com.examgov.backend.controller;

import com.examgov.backend.service.OfficerService;

import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/officer")
@PreAuthorize("hasRole('EXAM_OFFICER')")
public class OfficerController {

    private final OfficerService officerService;

    public OfficerController(OfficerService officerService) {
        this.officerService = officerService;
    }

    @PostMapping("/scan")
    public Map<String, Object> scanQrCode(@RequestBody Map<String, String> request, Authentication auth) {
        return officerService.scanQrCode(request.get("qrCode"), auth.getName());
    }

    @PostMapping("/verify/{registrationId}")
    public Map<String, String> allowEntry(@PathVariable Long registrationId, Authentication auth) {
        officerService.allowEntry(registrationId, auth.getName());
        return Map.of("message", "Student marked as attended.");
    }

    @GetMapping("/attendance")
    public List<Map<String, Object>> getAttendanceRecords(@RequestParam String date) {
        return officerService.getAttendanceRecords(date);
    }
}
