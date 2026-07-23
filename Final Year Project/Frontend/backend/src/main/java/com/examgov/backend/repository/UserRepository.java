package com.examgov.backend.repository;

import com.examgov.backend.domain.Role;
import com.examgov.backend.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByStudentId(Long studentId);

    Optional<User> findByTeacherId(Long teacherId);

    List<User> findByRoleAndCompanyId(Role role, Long companyId);

    List<User> findByRoleOrderByCreatedAtDesc(Role role);
}
