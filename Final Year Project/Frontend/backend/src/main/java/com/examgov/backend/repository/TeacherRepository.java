package com.examgov.backend.repository;

import com.examgov.backend.domain.Teacher;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    List<Teacher> findByCompanyId(Long companyId);

    Optional<Teacher> findByEmail(String email);
}
