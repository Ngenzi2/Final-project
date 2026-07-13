package com.examgov.backend.dto.response;

public record StudentVerifyResponse(boolean verified, String message, String studentName) {
}
