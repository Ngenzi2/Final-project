package com.examgov.backend.dto.request;

import com.examgov.backend.domain.WeekDay;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public record TimetableSlotRequest(
        @NotNull WeekDay day,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @NotBlank String activity) {
}
