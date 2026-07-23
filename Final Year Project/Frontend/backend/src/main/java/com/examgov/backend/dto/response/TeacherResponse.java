package com.examgov.backend.dto.response;

import com.examgov.backend.domain.WeekDay;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record TeacherResponse(
        Long id,
        String name,
        String email,
        String licenseNumber,
        Long companyId,
        LocalDate registeredAt,
        boolean active,
        List<TimetableSlotResponse> timetable) {

    public record TimetableSlotResponse(
            Long id, WeekDay day, LocalTime startTime, LocalTime endTime, String activity) {
    }
}
