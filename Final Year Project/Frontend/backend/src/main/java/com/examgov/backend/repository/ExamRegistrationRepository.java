package com.examgov.backend.repository;

import com.examgov.backend.domain.ExamRegistration;
import com.examgov.backend.domain.RegistrationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamRegistrationRepository extends JpaRepository<ExamRegistration, Long> {
    List<ExamRegistration> findByExamSlotId(Long examSlotId);

    List<ExamRegistration> findByStudentId(Long studentId);

    List<ExamRegistration> findByStudent_TeacherId(Long teacherId);

    List<ExamRegistration> findByStudent_CompanyId(Long companyId);

    boolean existsByStudentIdAndExamSlotIdAndStatus(Long studentId, Long examSlotId, RegistrationStatus status);

    long countByExamSlotIdAndStatus(Long examSlotId, RegistrationStatus status);

    Optional<ExamRegistration> findByQrCode(String qrCode);

    List<ExamRegistration> findByVerifiedByOfficerId(Long verifiedByOfficerId);
}
