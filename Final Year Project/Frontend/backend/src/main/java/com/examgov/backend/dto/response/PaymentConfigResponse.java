package com.examgov.backend.dto.response;

public record PaymentConfigResponse(int totalAmount, int siteShare, int companyShare, boolean testMode) {
}
