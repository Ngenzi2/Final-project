package com.examgov.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record ExamSlotRequest(
        @NotBlank String name,
        @NotBlank String location,
        @NotNull LocalDate examDate,
        @NotNull LocalTime startTime,
        @NotNull @Min(1) Integer capacity) {
}
