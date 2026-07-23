package com.examgov.backend.controller;

import com.examgov.backend.dto.response.QrScanLogResponse;
import com.examgov.backend.service.QrScanLogService;
import java.time.Instant;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/qr/scan-logs")
public class QrScanLogController {

    private final QrScanLogService qrScanLogService;

    public QrScanLogController(QrScanLogService qrScanLogService) {
        this.qrScanLogService = qrScanLogService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('AUTHORITY', 'EXAM_OFFICER')")
    public List<QrScanLogResponse> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {
        return qrScanLogService.list(from, to);
    }
}
