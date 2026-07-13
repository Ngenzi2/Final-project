package com.examgov.backend.repository;

import com.examgov.backend.domain.Student;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByCompanyId(Long companyId);

    List<Student> findByTeacherId(Long teacherId);

    List<Student> findByCompanyIdAndTeacherId(Long companyId, Long teacherId);

    Optional<Student> findByEmail(String email);
}
