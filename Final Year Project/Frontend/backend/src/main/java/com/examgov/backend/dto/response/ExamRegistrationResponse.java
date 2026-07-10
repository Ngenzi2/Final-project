package com.examgov.backend.dto.response;

import com.examgov.backend.domain.ExamResult;
import com.examgov.backend.domain.RegistrationStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record ExamRegistrationResponse(
        Long id,
        Long studentId,
        String studentName,
        String studentExamType,
        Long companyId,
        String companyName,
        Long teacherId,
        String teacherName,
        Long examSlotId,
        String examSlotName,
        String examSlotLocation,
        LocalDate examSlotDate,
        LocalTime examSlotStartTime,
        Instant registeredAt,
        boolean paid,
        LocalDate paymentDate,
        String qrCode,
        RegistrationStatus status,
        ExamResult result) {
}
