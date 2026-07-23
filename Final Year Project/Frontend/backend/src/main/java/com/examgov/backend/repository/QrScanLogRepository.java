package com.examgov.backend.repository;

import com.examgov.backend.domain.QrScanLog;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QrScanLogRepository extends JpaRepository<QrScanLog, Long> {
    List<QrScanLog> findAllByOrderByScannedAtDesc();

    List<QrScanLog> findByScannedAtBetweenOrderByScannedAtDesc(Instant from, Instant to);

    long countByEligible(boolean eligible);

    void deleteByExamRegistrationId(Long examRegistrationId);

    List<QrScanLog> findByScannedById(Long scannedById);
}
