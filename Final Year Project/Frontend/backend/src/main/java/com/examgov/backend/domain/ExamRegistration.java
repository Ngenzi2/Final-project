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
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "exam_registrations", uniqueConstraints = @UniqueConstraint(columnNames = { "student_id",
        "exam_slot_id" }))
@Getter
@Setter
@NoArgsConstructor
public class ExamRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_slot_id", nullable = false)
    private ExamSlot examSlot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registered_by")
    private User registeredBy;

    @Column(name = "registered_at", nullable = false)
    private Instant registeredAt;

    @Column(nullable = false)
    private boolean paid = false;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "qr_code", unique = true, nullable = false)
    private String qrCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus status = RegistrationStatus.BOOKED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExamResult result = ExamResult.PENDING;

    @Column(nullable = false)
    @ColumnDefault("false")
    private boolean attended = false;

    @Column(name = "verification_time")
    private Instant verificationTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_officer_id")
    private User verifiedByOfficer;
}
