package com.examgov.backend.dto.response;

import java.time.Instant;

public record QrScanLogResponse(
        Long id,
        String qrCode,
        Long studentId,
        String studentName,
        String companyName,
        String examSlotName,
        String scannedByName,
        boolean scannedByDeleted,
        Instant scannedAt,
        boolean eligible,
        String reason) {
}
