package com.examgov.backend.dto.request;

import com.examgov.backend.domain.ExamResult;
import jakarta.validation.constraints.NotNull;

public record ExamResultRequest(@NotNull ExamResult result) {
}
