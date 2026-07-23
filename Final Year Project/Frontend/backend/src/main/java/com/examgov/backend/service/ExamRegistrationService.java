package com.examgov.backend.service;

import com.examgov.backend.domain.ExamRegistration;
import com.examgov.backend.domain.ExamResult;
import com.examgov.backend.domain.ExamSlot;
import com.examgov.backend.domain.RegistrationStatus;
import com.examgov.backend.domain.Role;
import com.examgov.backend.domain.Student;
import com.examgov.backend.domain.TrainingStatus;
import com.examgov.backend.domain.User;
import com.examgov.backend.dto.request.BookingRequest;
import com.examgov.backend.dto.response.ExamRegistrationResponse;
import com.examgov.backend.dto.response.QrVerifyResponse;
import com.examgov.backend.exception.ConflictException;
import com.examgov.backend.exception.ForbiddenActionException;
import com.examgov.backend.exception.NotFoundException;
import com.examgov.backend.repository.ExamRegistrationRepository;
import com.examgov.backend.repository.ExamSlotRepository;
import com.examgov.backend.repository.StudentRepository;
import com.examgov.backend.repository.UserRepository;
import com.examgov.backend.security.AppUserDetails;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExamRegistrationService {

    private static final String QR_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ExamRegistrationRepository examRegistrationRepository;
    private final ExamSlotRepository examSlotRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final QrScanLogService qrScanLogService;

    public ExamRegistrationService(
            ExamRegistrationRepository examRegistrationRepository,
            ExamSlotRepository examSlotRepository,
            StudentRepository studentRepository,
            UserRepository userRepository,
            QrScanLogService qrScanLogService) {
        this.examRegistrationRepository = examRegistrationRepository;
        this.examSlotRepository = examSlotRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.qrScanLogService = qrScanLogService;
    }

    @Transactional
    public ExamRegistrationResponse book(BookingRequest request, AppUserDetails principal) {
        Student student =
                studentRepository.findById(request.studentId()).orElseThrow(() -> new NotFoundException("Student not found."));
        assertCanManageStudent(student, principal);

        if (student.getTrainingStatus() != TrainingStatus.READY_FOR_EXAM) {
            throw new ConflictException("Student is not ready for exam yet.");
        }

        ExamSlot examSlot =
                examSlotRepository.findById(request.examSlotId()).orElseThrow(() -> new NotFoundException("Exam slot not found."));

        if (examRegistrationRepository.existsByStudentIdAndExamSlotIdAndStatus(
                student.getId(), examSlot.getId(), RegistrationStatus.BOOKED)) {
            throw new ConflictException("This student is already booked onto this exam slot.");
        }

        long bookedCount = examRegistrationRepository.countByExamSlotIdAndStatus(examSlot.getId(), RegistrationStatus.BOOKED);
        if (bookedCount >= examSlot.getCapacity()) {
            throw new ConflictException("This exam slot is full.");
        }

        ExamRegistration registration = new ExamRegistration();
        registration.setStudent(student);
        registration.setExamSlot(examSlot);
        registration.setRegisteredBy(userRepository.findById(principal.getId()).orElse(null));
        registration.setRegisteredAt(Instant.now());
        registration.setPaid(false);
        registration.setStatus(RegistrationStatus.BOOKED);
        registration.setQrCode("QR-PENDING-" + RANDOM.nextInt(Integer.MAX_VALUE));
        registration = examRegistrationRepository.save(registration);

        registration.setQrCode("QR-" + registration.getId() + "-" + randomCode(6));
        registration = examRegistrationRepository.save(registration);

        return toResponse(registration);
    }

    @Transactional(readOnly = true)
    public List<ExamRegistrationResponse> listForSlot(Long examSlotId) {
        return examRegistrationRepository.findByExamSlotId(examSlotId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ExamRegistrationResponse> list(AppUserDetails principal, Long studentId, Long teacherId) {
        List<ExamRegistration> registrations;
        if (studentId != null) {
            Student student =
                    studentRepository.findById(studentId).orElseThrow(() -> new NotFoundException("Student not found."));
            assertCanViewStudent(student, principal);
            registrations = examRegistrationRepository.findByStudentId(studentId);
        } else if (teacherId != null) {
            if (principal.getRole() != Role.AUTHORITY
                    && !(principal.getRole() == Role.TEACHER && teacherId.equals(principal.getTeacherId()))
                    && principal.getRole() != Role.COMPANY) {
                throw new ForbiddenActionException("You do not have access to this teacher's bookings.");
            }
            registrations = examRegistrationRepository.findByStudent_TeacherId(teacherId);
        } else {
            registrations =
                    switch (principal.getRole()) {
                        case AUTHORITY, EXAM_OFFICER -> examRegistrationRepository.findAll();
                        case COMPANY -> examRegistrationRepository.findByStudent_CompanyId(principal.getCompanyId());
                        case TEACHER -> examRegistrationRepository.findByStudent_TeacherId(principal.getTeacherId());
                        case STUDENT ->
                                principal.getStudentId() != null
                                        ? examRegistrationRepository.findByStudentId(principal.getStudentId())
                                        : List.of();
                    };
        }
        return registrations.stream().map(this::toResponse).toList();
    }

    @Transactional
    public ExamRegistrationResponse markPaid(Long id, AppUserDetails principal) {
        ExamRegistration registration =
                examRegistrationRepository.findById(id).orElseThrow(() -> new NotFoundException("Registration not found."));

        if (principal.getRole() != Role.AUTHORITY) {
            throw new ForbiddenActionException(
                    "Only the authority can manually record a payment. Students must pay through the UrubutoPay checkout.");
        }

        registration.setPaid(true);
        registration.setPaymentDate(LocalDate.now());
        return toResponse(examRegistrationRepository.save(registration));
    }

    @Transactional
    public ExamRegistrationResponse setResult(Long id, ExamResult result, AppUserDetails principal) {
        if (principal.getRole() != Role.AUTHORITY) {
            throw new ForbiddenActionException("Only the authority can record an exam result.");
        }
        ExamRegistration registration =
                examRegistrationRepository.findById(id).orElseThrow(() -> new NotFoundException("Registration not found."));
        if (!registration.isPaid()) {
            throw new ConflictException("Cannot record a result for a registration that hasn't been paid.");
        }
        registration.setResult(result);
        return toResponse(examRegistrationRepository.save(registration));
    }

    @Transactional
    public void cancel(Long id, AppUserDetails principal) {
        ExamRegistration registration =
                examRegistrationRepository.findById(id).orElseThrow(() -> new NotFoundException("Registration not found."));
        assertCanManageStudent(registration.getStudent(), principal);
        registration.setStatus(RegistrationStatus.CANCELLED);
        examRegistrationRepository.save(registration);
    }

    @Transactional
    public QrVerifyResponse verify(String qrCode, AppUserDetails principal) {
        User scannedBy = userRepository.findById(principal.getId()).orElse(null);
        ExamRegistration registration = examRegistrationRepository.findByQrCode(qrCode).orElse(null);

        if (registration == null) {
            qrScanLogService.log(qrCode, null, scannedBy, false, "No matching registration");
            throw new NotFoundException("No registration matches this QR code.");
        }

        TrainingStatus trainingStatus = registration.getStudent().getTrainingStatus();
        String reason = null;
        boolean eligible = registration.isPaid()
                && trainingStatus == TrainingStatus.READY_FOR_EXAM
                && registration.getStatus() == RegistrationStatus.BOOKED;
        if (!eligible) {
            if (registration.getStatus() != RegistrationStatus.BOOKED) {
                reason = "Registration cancelled";
            } else if (!registration.isPaid()) {
                reason = "Not paid";
            } else {
                reason = "Training incomplete";
            }
        }
        qrScanLogService.log(qrCode, registration, scannedBy, eligible, reason);

        return new QrVerifyResponse(toResponse(registration), trainingStatus, eligible);
    }

    private void assertCanManageStudent(Student student, AppUserDetails principal) {
        if (principal.getRole() == Role.COMPANY && student.getCompany().getId().equals(principal.getCompanyId())) {
            return;
        }
        if (principal.getRole() == Role.TEACHER && student.getTeacher().getId().equals(principal.getTeacherId())) {
            return;
        }
        if (principal.getRole() == Role.AUTHORITY) {
            return;
        }
        throw new ForbiddenActionException("You do not have access to this student.");
    }

    private void assertCanViewStudent(Student student, AppUserDetails principal) {
        if (principal.getRole() == Role.STUDENT && student.getId().equals(principal.getStudentId())) {
            return;
        }
        assertCanManageStudent(student, principal);
    }

    private String randomCode(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(QR_ALPHABET.charAt(RANDOM.nextInt(QR_ALPHABET.length())));
        }
        return sb.toString();
    }

    private ExamRegistrationResponse toResponse(ExamRegistration registration) {
        Student student = registration.getStudent();
        ExamSlot slot = registration.getExamSlot();
        return new ExamRegistrationResponse(
                registration.getId(),
                student.getId(),
                student.getName(),
                student.getExamType().name(),
                student.getCompany().getId(),
                student.getCompany().getName(),
                student.getTeacher().getId(),
                student.getTeacher().getName(),
                slot.getId(),
                slot.getName(),
                slot.getLocation(),
                slot.getExamDate(),
                slot.getStartTime(),
                registration.getRegisteredAt(),
                registration.isPaid(),
                registration.getPaymentDate(),
                registration.getQrCode(),
                registration.getStatus(),
                registration.getResult());
    }
}
