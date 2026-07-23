package com.examgov.backend.service;

import com.examgov.backend.domain.Role;
import com.examgov.backend.domain.User;
import com.examgov.backend.dto.request.OfficerCreateRequest;
import com.examgov.backend.dto.response.OfficerAccountResponse;
import com.examgov.backend.dto.response.OfficerCreatedResponse;
import com.examgov.backend.domain.ExamRegistration;
import com.examgov.backend.domain.QrScanLog;
import com.examgov.backend.exception.ConflictException;
import com.examgov.backend.exception.NotFoundException;
import com.examgov.backend.repository.ExamRegistrationRepository;
import com.examgov.backend.repository.QrScanLogRepository;
import com.examgov.backend.repository.UserRepository;
import java.security.SecureRandom;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserManagementService {

    private static final String PASSWORD_CHARS =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    private static final int PASSWORD_LENGTH = 12;

    private final UserRepository userRepository;
    private final QrScanLogRepository qrScanLogRepository;
    private final ExamRegistrationRepository examRegistrationRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final SecureRandom random = new SecureRandom();

    public UserManagementService(
            UserRepository userRepository,
            QrScanLogRepository qrScanLogRepository,
            ExamRegistrationRepository examRegistrationRepository,
            PasswordEncoder passwordEncoder,
            MailService mailService) {
        this.userRepository = userRepository;
        this.qrScanLogRepository = qrScanLogRepository;
        this.examRegistrationRepository = examRegistrationRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailService = mailService;
    }

    @Transactional
    public OfficerCreatedResponse createOfficer(OfficerCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("An account with email " + request.email() + " already exists.");
        }

        String temporaryPassword = generatePassword();

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        user.setRole(Role.EXAM_OFFICER);
        user.setName(request.name());
        user.setEnabled(true);
        user = userRepository.save(user);

        mailService.sendOfficerCredentials(user.getEmail(), user.getName(), temporaryPassword);

        return new OfficerCreatedResponse(user.getId(), user.getName(), user.getEmail(), temporaryPassword);
    }

    @Transactional(readOnly = true)
    public List<OfficerAccountResponse> listOfficers() {
        return userRepository.findByRoleOrderByCreatedAtDesc(Role.EXAM_OFFICER).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public OfficerAccountResponse setOfficerEnabled(Long id, boolean enabled) {
        User user = findOfficer(id);
        user.setEnabled(enabled);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteOfficer(Long id) {
        User user = findOfficer(id);

        List<QrScanLog> scanLogs = qrScanLogRepository.findByScannedById(id);
        scanLogs.forEach(log -> log.setScannedBy(null));
        qrScanLogRepository.saveAll(scanLogs);

        List<ExamRegistration> verifiedRegistrations = examRegistrationRepository.findByVerifiedByOfficerId(id);
        verifiedRegistrations.forEach(registration -> registration.setVerifiedByOfficer(null));
        examRegistrationRepository.saveAll(verifiedRegistrations);

        userRepository.delete(user);
    }

    private User findOfficer(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("Officer account not found."));
        if (user.getRole() != Role.EXAM_OFFICER) {
            throw new NotFoundException("Officer account not found.");
        }
        return user;
    }

    private String generatePassword() {
        StringBuilder sb = new StringBuilder(PASSWORD_LENGTH);
        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            sb.append(PASSWORD_CHARS.charAt(random.nextInt(PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }

    private OfficerAccountResponse toResponse(User user) {
        return new OfficerAccountResponse(user.getId(), user.getName(), user.getEmail(), user.isEnabled(), user.getCreatedAt());
    }
}
