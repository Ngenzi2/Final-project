package com.examgov.backend.service;

import com.examgov.backend.domain.ExamRegistration;
import com.examgov.backend.domain.QrScanLog;
import com.examgov.backend.domain.User;
import com.examgov.backend.dto.response.QrScanLogResponse;
import com.examgov.backend.repository.QrScanLogRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QrScanLogService {

    private final QrScanLogRepository qrScanLogRepository;

    public QrScanLogService(QrScanLogRepository qrScanLogRepository) {
        this.qrScanLogRepository = qrScanLogRepository;
    }

    // REQUIRES_NEW so the scan is always recorded even when the caller's transaction
    // (e.g. verify() throwing NotFoundException for a no-match code) rolls back.
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String qrCode, ExamRegistration registration, User scannedBy, boolean eligible, String reason) {
        QrScanLog log = new QrScanLog();
        log.setQrCode(qrCode);
        log.setExamRegistration(registration);
        log.setScannedBy(scannedBy);
        log.setScannedAt(Instant.now());
        log.setEligible(eligible);
        log.setReason(reason);
        qrScanLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<QrScanLogResponse> list(Instant from, Instant to) {
        List<QrScanLog> logs =
                from != null && to != null
                        ? qrScanLogRepository.findByScannedAtBetweenOrderByScannedAtDesc(from, to)
                        : qrScanLogRepository.findAllByOrderByScannedAtDesc();
        return logs.stream().map(this::toResponse).toList();
    }

    private QrScanLogResponse toResponse(QrScanLog log) {
        ExamRegistration registration = log.getExamRegistration();
        User scannedBy = log.getScannedBy();
        return new QrScanLogResponse(
                log.getId(),
                log.getQrCode(),
                registration != null ? registration.getStudent().getId() : null,
                registration != null ? registration.getStudent().getName() : null,
                registration != null ? registration.getStudent().getCompany().getName() : null,
                registration != null ? registration.getExamSlot().getName() : null,
                scannedBy != null ? scannedBy.getName() : "Deleted officer",
                scannedBy == null,
                log.getScannedAt(),
                log.isEligible(),
                log.getReason());
    }
}
