package com.examgov.backend.dto.response;

import com.examgov.backend.domain.ExamType;
import com.examgov.backend.domain.TrainingStatus;
import java.time.LocalDate;

public record StudentResponse(
        Long id,
        String name,
        String nationalId,
        String email,
        ExamType examType,
        Long companyId,
        Long teacherId,
        TrainingStatus trainingStatus,
        LocalDate registeredAt,
        String photoUrl) {
}
