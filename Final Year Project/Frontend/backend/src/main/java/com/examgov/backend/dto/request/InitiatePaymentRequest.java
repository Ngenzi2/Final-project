package com.examgov.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record InitiatePaymentRequest(
        @NotBlank @Pattern(regexp = "MOMO|AIRTEL_MONEY", message = "channelName must be MOMO or AIRTEL_MONEY") String channelName,
        @NotBlank @Pattern(regexp = "07[0-9]{8}", message = "Enter a valid Rwandan phone number, e.g. 0788123456") String phoneNumber) {
}
