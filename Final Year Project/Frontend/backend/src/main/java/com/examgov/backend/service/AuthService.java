package com.examgov.backend.service;

import com.examgov.backend.domain.ApprovalStatus;
import com.examgov.backend.domain.User;
import com.examgov.backend.dto.response.LoginResponse;
import com.examgov.backend.dto.response.UserResponse;
import com.examgov.backend.exception.InvalidCredentialsException;
import com.examgov.backend.exception.NotFoundException;
import com.examgov.backend.repository.UserRepository;
import com.examgov.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Random;
import com.examgov.backend.domain.Role;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MailService mailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
            MailService mailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(String email, String rawPassword) {
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password."));

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password.");
        }

        if (user.getTeacher() != null && !user.getTeacher().isActive()) {
            throw new InvalidCredentialsException("This teacher account has been deactivated by the company.");
        }

        if (user.getRole() == Role.EXAM_OFFICER && !user.isEnabled()) {
            throw new InvalidCredentialsException("This officer account has been deactivated.");
        }

        if (user.getStudent() != null && !user.isEnabled()) {
            if (user.getStudent().getApprovalStatus() == ApprovalStatus.PENDING) {
                throw new InvalidCredentialsException(
                        "Your registration is awaiting approval from your driving company.");
            }
            if (user.getStudent().getApprovalStatus() == ApprovalStatus.REJECTED) {
                throw new InvalidCredentialsException("Your registration was rejected by your driving company.");
            }
            throw new InvalidCredentialsException(
                    "Please verify your email before signing in. Check your inbox for the verification link.");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token, toResponse(user));
    }

    @Transactional
    public void sendStudentOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Account not found."));

        if (user.getRole() != Role.STUDENT) {
            throw new InvalidCredentialsException("Only students can log in using OTP.");
        }

        if (!user.isEnabled() || user.getStudent() == null) {
            if (user.getStudent() != null && user.getStudent().getApprovalStatus() == ApprovalStatus.PENDING) {
                throw new InvalidCredentialsException("Your registration is awaiting approval.");
            }
            if (user.getStudent() != null && user.getStudent().getApprovalStatus() == ApprovalStatus.APPROVED) {
                user.setEnabled(true);
                userRepository.save(user);
            } else {
                throw new InvalidCredentialsException("Your account is not active.");
            }
        }

        String otp = String.format("%06d", new Random().nextInt(900000) + 100000);
        user.setOtpCode(otp);
        user.setOtpExpiry(Instant.now().plus(10, ChronoUnit.MINUTES));
        userRepository.save(user);

        mailService.sendStudentVerificationOtp(user.getEmail(), user.getName(), otp);
    }

    @Transactional
    public LoginResponse verifyStudentOtp(String email, String otpCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Account not found."));

        if (user.getOtpCode() == null || !user.getOtpCode().equals(otpCode)) {
            throw new InvalidCredentialsException("Invalid OTP.");
        }

        if (user.getOtpExpiry() == null || Instant.now().isAfter(user.getOtpExpiry())) {
            throw new InvalidCredentialsException("OTP has expired.");
        }

        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token, toResponse(user));
    }

    @Transactional
    public void sendForgotPasswordOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException(
                        "If the email is registered, a password reset link has been sent."));

        if (!user.isEnabled()) {
            throw new InvalidCredentialsException("Account is disabled.");
        }

        String otp = String.format("%06d", new Random().nextInt(900000) + 100000);
        user.setOtpCode(otp);
        user.setOtpExpiry(Instant.now().plus(15, ChronoUnit.MINUTES));
        userRepository.save(user);

        mailService.sendPasswordResetOtp(user.getEmail(), user.getName(), otp);
    }

    @Transactional
    public void resetPassword(String email, String otpCode, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Account not found."));

        if (user.getOtpCode() == null || !user.getOtpCode().equals(otpCode)) {
            throw new InvalidCredentialsException("Invalid or expired reset code.");
        }

        if (user.getOtpExpiry() == null || Instant.now().isAfter(user.getOtpExpiry())) {
            throw new InvalidCredentialsException("Reset code has expired. Please request a new one.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, String> identifyUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Account not found."));
        return java.util.Map.of("role", user.getRole().name());
    }

    @Transactional(readOnly = true)
    public UserResponse me(String email) {
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found."));
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getName(),
                user.getCompany() != null ? user.getCompany().getId() : null,
                user.getTeacher() != null ? user.getTeacher().getId() : null,
                user.getStudent() != null ? user.getStudent().getId() : null);
    }
}
