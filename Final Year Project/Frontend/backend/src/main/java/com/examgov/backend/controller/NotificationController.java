package com.examgov.backend.controller;

import com.examgov.backend.dto.response.NotificationResponse;
import com.examgov.backend.security.AppUserDetails;
import com.examgov.backend.service.NotificationService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> listMyNotifications(@AuthenticationPrincipal AppUserDetails principal) {
        return notificationService.getUserNotifications(principal);
    }

    @PatchMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id, @AuthenticationPrincipal AppUserDetails principal) {
        notificationService.markAsRead(id, principal);
    }
}
