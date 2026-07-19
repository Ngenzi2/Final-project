package com.examgov.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "payments", uniqueConstraints = @UniqueConstraint(columnNames = "transaction_id"))
@Getter
@Setter
@NoArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_registration_id", nullable = false)
    private ExamRegistration examRegistration;

    @Column(nullable = false)
    private int amount;

    @Column(name = "site_share", nullable = false)
    private int siteShare;

    @Column(name = "company_share", nullable = false)
    private int companyShare;

    @Column(name = "payment_reference", nullable = false, unique = true)
    private String paymentReference;

    @Column(name = "transaction_id", nullable = false, unique = true)
    private String transactionId;

    @Column(name = "external_transaction_id")
    private String externalTransactionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "payer_phone_number")
    private String payerPhoneNumber;

    @Column(name = "payment_date")
    private Instant paymentDate;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "last_checked_at")
    private Instant lastCheckedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public void touch() {
        this.updatedAt = Instant.now();
    }
}
