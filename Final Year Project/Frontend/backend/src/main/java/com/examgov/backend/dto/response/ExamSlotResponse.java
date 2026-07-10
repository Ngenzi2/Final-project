package com.examgov.backend.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;

public record ExamSlotResponse(
        Long id,
        String name,
        String location,
        LocalDate examDate,
        LocalTime startTime,
        int capacity,
        long bookedCount) {
}
