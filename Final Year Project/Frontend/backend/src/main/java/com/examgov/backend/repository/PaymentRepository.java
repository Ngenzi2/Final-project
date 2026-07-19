package com.examgov.backend.repository;

import com.examgov.backend.domain.Payment;
import com.examgov.backend.domain.PaymentStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByStatus(PaymentStatus status);

    List<Payment> findByExamRegistrationIdOrderByCreatedAtDesc(Long examRegistrationId);

    Optional<Payment> findFirstByExamRegistrationIdOrderByCreatedAtDesc(Long examRegistrationId);

    boolean existsByExamRegistrationIdAndStatusIn(Long examRegistrationId, List<PaymentStatus> statuses);

    Optional<Payment> findByTransactionId(String transactionId);

    List<Payment> findByExamRegistration_Student_CompanyIdOrderByCreatedAtDesc(Long companyId);

    List<Payment> findByExamRegistration_StudentIdOrderByCreatedAtDesc(Long studentId);

    List<Payment> findByExamRegistration_Student_TeacherIdOrderByCreatedAtDesc(Long teacherId);

    List<Payment> findAllByOrderByCreatedAtDesc();
}
