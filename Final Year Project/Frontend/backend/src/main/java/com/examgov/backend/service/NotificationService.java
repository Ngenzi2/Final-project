package com.examgov.backend.service;

import com.examgov.backend.domain.Notification;
import com.examgov.backend.domain.Role;
import com.examgov.backend.domain.User;
import com.examgov.backend.dto.response.NotificationResponse;
import com.examgov.backend.exception.ForbiddenActionException;
import com.examgov.backend.exception.NotFoundException;
import com.examgov.backend.repository.NotificationRepository;
import com.examgov.backend.repository.UserRepository;
import com.examgov.backend.security.AppUserDetails;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(AppUserDetails principal) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(principal.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void markAsRead(Long id, AppUserDetails principal) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Notification not found."));

        if (!notification.getRecipient().getId().equals(principal.getId())) {
            throw new ForbiddenActionException("Access denied.");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void notifyUsers(String title, String message, Long companyId, Long teacherId) {
        List<User> authorities = userRepository.findByRoleOrderByCreatedAtDesc(Role.AUTHORITY);
        List<User> companyAdmins = companyId != null ? userRepository.findByRoleAndCompanyId(Role.COMPANY, companyId)
                : List.of();
        User teacher = teacherId != null ? userRepository.findByTeacherId(teacherId).orElse(null) : null;

        for (User auth : authorities) {
            notificationRepository.save(new Notification(auth, title, message));
        }
        for (User co : companyAdmins) {
            notificationRepository.save(new Notification(co, title, message));
        }
        if (teacher != null) {
            notificationRepository.save(new Notification(teacher, title, message));
        }
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(n.getId(), n.getTitle(), n.getMessage(), n.isRead(), n.getCreatedAt());
    }
}
