package com.examgov.backend.dto.response;

import com.examgov.backend.domain.TrainingStatus;

public record QrVerifyResponse(ExamRegistrationResponse registration, TrainingStatus trainingStatus, boolean eligible) {
}
