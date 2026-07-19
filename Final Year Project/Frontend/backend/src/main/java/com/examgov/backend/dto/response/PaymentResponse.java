package com.examgov.backend.dto.response;

import com.examgov.backend.domain.PaymentStatus;
import java.time.Instant;

public record PaymentResponse(
        Long id,
        Long examRegistrationId,
        Long studentId,
        String studentName,
        Long companyId,
        String companyName,
        int amount,
        int siteShare,
        int companyShare,
        String paymentReference,
        String transactionId,
        String externalTransactionId,
        PaymentStatus status,
        String paymentMethod,
        String payerPhoneNumber,
        Instant paymentDate,
        String failureReason,
        Instant createdAt,
        Instant updatedAt) {
}
