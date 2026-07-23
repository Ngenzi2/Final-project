package com.examgov.backend.seed;

import com.examgov.backend.domain.Role;
import com.examgov.backend.domain.User;
import com.examgov.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.findByEmail("authority@examgov.rw").isPresent()) {
            return;
        }

        System.out.println("---------- SEEDING DATABASE ----------");
        System.out.println("Creating default Authority Root Account...");

        User authority = new User();
        authority.setEmail("authority@examgov.rw");
        authority.setPasswordHash(passwordEncoder.encode("authority123"));
        authority.setRole(Role.AUTHORITY);
        authority.setName("Ministry Authority (ROOT)");
        userRepository.save(authority);

        System.out.println("---------- SEEDING COMPLETE ----------");
    }
}
