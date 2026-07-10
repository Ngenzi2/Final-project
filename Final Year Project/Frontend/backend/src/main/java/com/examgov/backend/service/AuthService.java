package com.examgov.backend.service;

import com.examgov.backend.domain.User;
import com.examgov.backend.dto.response.LoginResponse;
import com.examgov.backend.dto.response.UserResponse;
import com.examgov.backend.exception.InvalidCredentialsException;
import com.examgov.backend.repository.UserRepository;
import com.examgov.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(String email, String rawPassword) {
        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password."));

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password.");
        }

        if (user.getTeacher() != null && !user.getTeacher().isActive()) {
            throw new InvalidCredentialsException("This teacher account has been deactivated by the company.");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token, toResponse(user));
    }

    @Transactional(readOnly = true)
    public UserResponse me(String email) {
        User user =
                userRepository
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
