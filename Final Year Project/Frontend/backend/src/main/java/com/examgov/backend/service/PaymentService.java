package com.examgov.backend.service;

import com.examgov.backend.domain.ExamRegistration;
import com.examgov.backend.domain.Payment;
import com.examgov.backend.domain.PaymentStatus;
import com.examgov.backend.domain.Role;
import com.examgov.backend.domain.Student;
import com.examgov.backend.dto.request.InitiatePaymentRequest;
import com.examgov.backend.dto.response.PaymentConfigResponse;
import com.examgov.backend.dto.response.PaymentResponse;
import com.examgov.backend.exception.ConflictException;
import com.examgov.backend.exception.ForbiddenActionException;
import com.examgov.backend.exception.NotFoundException;
import com.examgov.backend.repository.ExamRegistrationRepository;
import com.examgov.backend.repository.PaymentRepository;
import com.examgov.backend.security.AppUserDetails;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
    private static final List<String> ALLOWED_CHANNELS = List.of("MOMO", "AIRTEL_MONEY");
    private static final List<PaymentStatus> ACTIVE_STATUSES = List.of(PaymentStatus.PENDING, PaymentStatus.PAID);
    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final PaymentRepository paymentRepository;
    private final ExamRegistrationRepository examRegistrationRepository;
    private final UrubutoPayClient urubutoPayClient;
    private final MailService mailService;
    private final QrImageService qrImageService;
    private final int totalAmount;
    private final int siteShare;
    private final int companyShare;
    private final boolean testMode;

    public PaymentService(
            PaymentRepository paymentRepository,
            ExamRegistrationRepository examRegistrationRepository,
            UrubutoPayClient urubutoPayClient,
            MailService mailService,
            QrImageService qrImageService,
            @Value("${payment.total-amount}") int totalAmount,
            @Value("${payment.site-share}") int siteShare,
            @Value("${payment.company-share}") int companyShare,
            @Value("${payment.test-mode}") boolean testMode) {
        this.paymentRepository = paymentRepository;
        this.examRegistrationRepository = examRegistrationRepository;
        this.urubutoPayClient = urubutoPayClient;
        this.mailService = mailService;
        this.qrImageService = qrImageService;
        this.totalAmount = totalAmount;
        this.siteShare = siteShare;
        this.companyShare = companyShare;
        this.testMode = testMode;
    }

    public PaymentConfigResponse getConfig() {
        return new PaymentConfigResponse(totalAmount, siteShare, companyShare, testMode);
    }

    @Transactional
    public PaymentResponse initiate(Long registrationId, InitiatePaymentRequest request, AppUserDetails principal) {
        ExamRegistration registration = examRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new NotFoundException("Registration not found."));
        assertCanPay(registration, principal);

        if (registration.isPaid()) {
            throw new ConflictException("This registration has already been paid for.");
        }
        if (paymentRepository.existsByExamRegistrationIdAndStatusIn(registrationId, ACTIVE_STATUSES)) {
            throw new ConflictException("A payment is already in progress or completed for this registration.");
        }

        String channel = request.channelName().toUpperCase();
        if (!ALLOWED_CHANNELS.contains(channel)) {
            throw new ConflictException("Payment channel must be MOMO or AIRTEL_MONEY.");
        }

        Student student = registration.getStudent();

        Payment payment = new Payment();
        payment.setExamRegistration(registration);
        payment.setAmount(totalAmount);
        payment.setSiteShare(siteShare);
        payment.setCompanyShare(companyShare);
        payment.setPaymentReference(generateCode("EXG-", 8));
        payment.setTransactionId(generateTransactionId());
        payment.setPaymentMethod(channel);
        payment.setPayerPhoneNumber(request.phoneNumber());
        payment.setStatus(PaymentStatus.PENDING);
        payment = paymentRepository.save(payment);

        UrubutoPayClient.InitiateResult result = urubutoPayClient.initiatePayment(
                payment.getPaymentReference(),
                student.getName(),
                student.getEmail(),
                toInternationalFormat(request.phoneNumber()),
                totalAmount,
                channel,
                payment.getTransactionId());

        if (!result.requestSucceeded()) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(result.message());
            payment.touch();
            paymentRepository.save(payment);
            log.warn("Payment initiation failed for registration {}: {}", registrationId, result.message());
            throw new ConflictException(result.message() != null ? result.message() : "Failed to initiate payment.");
        }

        if (result.internalTransactionRefNumber() != null) {
            payment.setExternalTransactionId(result.internalTransactionRefNumber());
        }
        payment.touch();
        payment = paymentRepository.save(payment);

        log.info(
                "Payment initiated: registration={} reference={} transactionId={} channel={}",
                registrationId, payment.getPaymentReference(), payment.getTransactionId(), channel);

        return toResponse(payment);
    }

    @Transactional
    public PaymentResponse cancel(Long paymentId, AppUserDetails principal) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment not found."));
        assertCanPay(payment.getExamRegistration(), principal);
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new ConflictException("Only a pending payment can be cancelled.");
        }
        payment.setStatus(PaymentStatus.CANCELLED);
        payment.touch();
        log.info("Payment {} cancelled by {}", paymentId, principal.getUsername());
        return toResponse(paymentRepository.save(payment));
    }

    @Transactional(readOnly = true)
    public PaymentResponse getForRegistration(Long registrationId, AppUserDetails principal) {
        ExamRegistration registration = examRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new NotFoundException("Registration not found."));
        assertCanView(registration, principal);
        return paymentRepository.findFirstByExamRegistrationIdOrderByCreatedAtDesc(registrationId)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> list(AppUserDetails principal) {
        List<Payment> payments = switch (principal.getRole()) {
            case AUTHORITY, EXAM_OFFICER -> paymentRepository.findAllByOrderByCreatedAtDesc();
            case COMPANY -> paymentRepository.findByExamRegistration_Student_CompanyIdOrderByCreatedAtDesc(principal.getCompanyId());
            case TEACHER -> paymentRepository.findByExamRegistration_Student_TeacherIdOrderByCreatedAtDesc(principal.getTeacherId());
            case STUDENT ->
                    principal.getStudentId() != null
                            ? paymentRepository.findByExamRegistration_StudentIdOrderByCreatedAtDesc(principal.getStudentId())
                            : List.of();
        };
        return payments.stream().map(this::toResponse).toList();
    }

    @Transactional
    public void reconcilePendingPayments() {
        List<Payment> pending = paymentRepository.findByStatus(PaymentStatus.PENDING);
        for (Payment payment : pending) {
            try {
                reconcileOne(payment);
            } catch (Exception e) {
                log.error("Failed to reconcile payment {}", payment.getId(), e);
            }
        }
    }

    private void reconcileOne(Payment payment) {
        UrubutoPayClient.StatusResult result = urubutoPayClient.verifyTransactionStatus(payment.getTransactionId());
        payment.setLastCheckedAt(Instant.now());

        if (!result.requestSucceeded()) {
            paymentRepository.save(payment);
            return;
        }

        String status = result.transactionStatus();
        if ("VALID".equals(status)) {
            markPaid(payment, result.internalTransactionId());
        } else if ("FAILED".equals(status) || "CANCELED".equals(status) || "CANCELLED".equals(status)) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Payment " + status.toLowerCase() + " at the payment gateway.");
            payment.touch();
            paymentRepository.save(payment);
            log.info("Payment {} marked FAILED (gateway status {})", payment.getId(), status);
        } else {
            // INITIATED, PENDING, PENDING_SETTLEMENT, or unknown yet at the gateway - keep polling.
            paymentRepository.save(payment);
        }
    }

    @Transactional
    public void markPaid(Payment payment, String externalTransactionId) {
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaymentDate(Instant.now());
        if (externalTransactionId != null) {
            payment.setExternalTransactionId(externalTransactionId);
        }
        payment.touch();
        paymentRepository.save(payment);

        ExamRegistration registration = payment.getExamRegistration();
        registration.setPaid(true);
        registration.setPaymentDate(LocalDate.now());
        registration.setQrCode(generateCode("QR-" + registration.getId() + "-", 8));
        examRegistrationRepository.save(registration);

        log.info(
                "Payment {} for registration {} confirmed PAID (transactionId={})",
                payment.getId(), registration.getId(), payment.getTransactionId());

        Student student = registration.getStudent();
        try {
            byte[] qrPng = qrImageService.generatePng(registration.getQrCode(), 300);
            String examDetails = "Your exam is scheduled at " + registration.getExamSlot().getName() + " on "
                    + registration.getExamSlot().getExamDate() + " at " + registration.getExamSlot().getStartTime() + ".";
            mailService.sendPaymentQrCode(student.getEmail(), student.getName(), registration.getQrCode(), examDetails, qrPng);
        } catch (Exception e) {
            log.error("Failed to email QR code for registration {}", registration.getId(), e);
        }
    }

    private void assertCanPay(ExamRegistration registration, AppUserDetails principal) {
        if (principal.getRole() == Role.STUDENT && registration.getStudent().getId().equals(principal.getStudentId())) {
            return;
        }
        if (principal.getRole() == Role.AUTHORITY) {
            return;
        }
        throw new ForbiddenActionException("You do not have access to this registration.");
    }

    private void assertCanView(ExamRegistration registration, AppUserDetails principal) {
        if (principal.getRole() == Role.COMPANY && registration.getStudent().getCompany().getId().equals(principal.getCompanyId())) {
            return;
        }
        if (principal.getRole() == Role.TEACHER && registration.getStudent().getTeacher().getId().equals(principal.getTeacherId())) {
            return;
        }
        if (principal.getRole() == Role.EXAM_OFFICER) {
            return;
        }
        assertCanPay(registration, principal);
    }

    private PaymentResponse toResponse(Payment payment) {
        ExamRegistration registration = payment.getExamRegistration();
        Student student = registration.getStudent();
        return new PaymentResponse(
                payment.getId(),
                registration.getId(),
                student.getId(),
                student.getName(),
                student.getCompany().getId(),
                student.getCompany().getName(),
                payment.getAmount(),
                payment.getSiteShare(),
                payment.getCompanyShare(),
                payment.getPaymentReference(),
                payment.getTransactionId(),
                payment.getExternalTransactionId(),
                payment.getStatus(),
                payment.getPaymentMethod(),
                payment.getPayerPhoneNumber(),
                payment.getPaymentDate(),
                payment.getFailureReason(),
                payment.getCreatedAt(),
                payment.getUpdatedAt());
    }

    private String generateCode(String prefix, int randomLength) {
        StringBuilder sb = new StringBuilder(prefix);
        for (int i = 0; i < randomLength; i++) {
            sb.append(CODE_ALPHABET.charAt(RANDOM.nextInt(CODE_ALPHABET.length())));
        }
        return sb.toString();
    }

    private String toInternationalFormat(String localPhoneNumber) {
        // UrubutoPay expects the 250-country-code format (e.g. 250788123456); students enter the
        // familiar local format (0788123456).
        return "250" + localPhoneNumber.substring(1);
    }

    private String generateTransactionId() {
        return "TXN" + System.currentTimeMillis() + RANDOM.nextInt(1000, 9999);
    }
}
