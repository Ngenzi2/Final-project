package com.examgov.backend.service;

import com.examgov.backend.domain.ExamRegistration;
import com.examgov.backend.domain.QrScanLog;
import com.examgov.backend.domain.User;
import com.examgov.backend.exception.NotFoundException;
import com.examgov.backend.repository.ExamRegistrationRepository;
import com.examgov.backend.repository.QrScanLogRepository;
import com.examgov.backend.repository.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OfficerService {

        private final ExamRegistrationRepository examRegistrationRepository;
        private final QrScanLogRepository qrScanLogRepository;
        private final UserRepository userRepository;

        public OfficerService(
                        ExamRegistrationRepository examRegistrationRepository,
                        QrScanLogRepository qrScanLogRepository,
                        UserRepository userRepository) {
                this.examRegistrationRepository = examRegistrationRepository;
                this.qrScanLogRepository = qrScanLogRepository;
                this.userRepository = userRepository;
        }

        @Transactional
        public Map<String, Object> scanQrCode(String qrCode, String officerEmail) {
                User officer = userRepository.findByEmail(officerEmail)
                                .orElseThrow(() -> new NotFoundException("Officer not found"));

                ExamRegistration registration = examRegistrationRepository.findByQrCode(qrCode)
                                .orElseThrow(() -> new NotFoundException(
                                                "Invalid QR Code: No matching registration found"));

                boolean eligible = registration.isPaid() && !registration.isAttended();
                String reason = eligible ? "Valid"
                                : (registration.isAttended() ? "Already marked present" : "Missing payment");

                QrScanLog scanLog = new QrScanLog();
                scanLog.setQrCode(qrCode);
                scanLog.setExamRegistration(registration);
                scanLog.setScannedBy(officer);
                scanLog.setScannedAt(Instant.now());
                scanLog.setEligible(eligible);
                scanLog.setReason(reason);
                qrScanLogRepository.save(scanLog);

                return Map.of(
                                "studentName", registration.getStudent().getName(),
                                "companyName", registration.getStudent().getCompany().getName(),
                                "teacherName", registration.getStudent().getTeacher().getName(),
                                "paid", registration.isPaid(),
                                "eligible", eligible,
                                "reason", reason,
                                "registrationId", registration.getId(),
                                "attended", registration.isAttended());
        }

        @Transactional
        public void allowEntry(Long registrationId, String officerEmail) {
                User officer = userRepository.findByEmail(officerEmail)
                                .orElseThrow(() -> new NotFoundException("Officer not found"));

                ExamRegistration registration = examRegistrationRepository.findById(registrationId)
                                .orElseThrow(() -> new NotFoundException("Registration not found"));

                registration.setAttended(true);
                registration.setVerificationTime(Instant.now());
                registration.setVerifiedByOfficer(officer);
                examRegistrationRepository.save(registration);
        }

        @Transactional(readOnly = true)
        public List<Map<String, Object>> getAttendanceRecords(String dateStr) {
                LocalDate date = LocalDate.parse(dateStr);
                // We'll manually filter in this demo context, or rely on a custom JPQL query.
                List<ExamRegistration> registrations = examRegistrationRepository.findAll();

                return registrations.stream()
                                .filter(r -> r.getExamSlot().getExamDate().equals(date))
                                .map(r -> {
                                        Map<String, Object> record = new java.util.HashMap<>();
                                        record.put("registrationId", r.getId());
                                        record.put("studentName", r.getStudent().getName());
                                        record.put("nationalId", r.getStudent().getNationalId());
                                        record.put("qrCode", r.getQrCode());
                                        record.put("companyName", r.getStudent().getCompany().getName());
                                        record.put("teacherName", r.getStudent().getTeacher().getName());
                                        record.put("paid", r.isPaid());
                                        record.put("attended", r.isAttended());
                                        record.put("verificationTime",
                                                        r.getVerificationTime() != null
                                                                        ? r.getVerificationTime().toString()
                                                                        : "");
                                        record.put("officerName",
                                                        r.getVerifiedByOfficer() != null
                                                                        ? r.getVerifiedByOfficer().getName()
                                                                        : "");
                                        return record;
                                })
                                .toList();
        }
}
