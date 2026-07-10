package com.examgov.backend.dto.request;

import com.examgov.backend.domain.TrainingStatus;
import jakarta.validation.constraints.NotNull;

public record TrainingStatusRequest(@NotNull TrainingStatus trainingStatus) {
}
