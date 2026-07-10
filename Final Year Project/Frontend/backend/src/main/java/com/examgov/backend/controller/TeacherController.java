package com.examgov.backend.controller;

import com.examgov.backend.dto.request.TeacherCreateRequest;
import com.examgov.backend.dto.request.TimetableSlotRequest;
import com.examgov.backend.dto.response.TeacherResponse;
import com.examgov.backend.security.AppUserDetails;
import com.examgov.backend.service.TeacherService;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping
    public List<TeacherResponse> list(@AuthenticationPrincipal AppUserDetails principal) {
        return teacherService.list(principal);
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    public TeacherResponse create(
            @Valid @RequestBody TeacherCreateRequest request, @AuthenticationPrincipal AppUserDetails principal) {
        return teacherService.create(request, principal);
    }

    @PostMapping("/{id}/timetable")
    @PreAuthorize("hasAnyRole('COMPANY', 'TEACHER')")
    public TeacherResponse addTimetableSlot(
            @PathVariable Long id,
            @Valid @RequestBody TimetableSlotRequest request,
            @AuthenticationPrincipal AppUserDetails principal) {
        return teacherService.addTimetableSlot(id, request, principal);
    }

    @DeleteMapping("/{id}/timetable/{slotId}")
    @PreAuthorize("hasAnyRole('COMPANY', 'TEACHER')")
    public TeacherResponse removeTimetableSlot(
            @PathVariable Long id, @PathVariable Long slotId, @AuthenticationPrincipal AppUserDetails principal) {
        return teacherService.removeTimetableSlot(id, slotId, principal);
    }

    @PatchMapping("/{id}/active")
    @PreAuthorize("hasRole('COMPANY')")
    public TeacherResponse setActive(
            @PathVariable Long id,
            @RequestBody TeacherActiveRequest request,
            @AuthenticationPrincipal AppUserDetails principal) {
        return teacherService.setActive(id, request.active(), principal);
    }

    public record TeacherActiveRequest(boolean active) {
    }
}
