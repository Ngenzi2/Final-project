package com.examgov.backend.controller;

import com.examgov.backend.dto.request.OfficerCreateRequest;
import com.examgov.backend.dto.response.OfficerAccountResponse;
import com.examgov.backend.dto.response.OfficerCreatedResponse;
import com.examgov.backend.service.UserManagementService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/officers")
@PreAuthorize("hasRole('AUTHORITY')")
public class UserManagementController {

    private final UserManagementService userManagementService;

    public UserManagementController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @GetMapping
    public List<OfficerAccountResponse> list() {
        return userManagementService.listOfficers();
    }

    @PostMapping
    public OfficerCreatedResponse create(@Valid @RequestBody OfficerCreateRequest request) {
        return userManagementService.createOfficer(request);
    }

    @PatchMapping("/{id}/active")
    public OfficerAccountResponse setActive(@PathVariable Long id, @RequestBody ActiveRequest request) {
        return userManagementService.setOfficerEnabled(id, request.active());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        userManagementService.deleteOfficer(id);
    }

    public record ActiveRequest(boolean active) {
    }
}
