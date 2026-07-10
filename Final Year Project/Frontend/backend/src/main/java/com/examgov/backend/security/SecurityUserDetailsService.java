package com.examgov.backend.security;

import com.examgov.backend.domain.User;
import com.examgov.backend.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SecurityUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public SecurityUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AppUserDetails loadUserByUsername(String email) {
        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() -> new UsernameNotFoundException("No user with email " + email));

        return new AppUserDetails(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole(),
                user.getName(),
                user.getCompany() != null ? user.getCompany().getId() : null,
                user.getTeacher() != null ? user.getTeacher().getId() : null,
                user.getStudent() != null ? user.getStudent().getId() : null);
    }
}
