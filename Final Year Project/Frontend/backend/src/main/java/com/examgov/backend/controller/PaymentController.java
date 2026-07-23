package com.examgov.backend.controller;

import com.examgov.backend.dto.request.InitiatePaymentRequest;
import com.examgov.backend.dto.response.PaymentConfigResponse;
import com.examgov.backend.dto.response.PaymentResponse;
import com.examgov.backend.security.AppUserDetails;
import com.examgov.backend.service.PaymentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/config")
    public PaymentConfigResponse getConfig() {
        return paymentService.getConfig();
    }

    @GetMapping
    public List<PaymentResponse> list(@AuthenticationPrincipal AppUserDetails principal) {
        return paymentService.list(principal);
    }

    @GetMapping("/registrations/{registrationId}")
    public PaymentResponse getForRegistration(
            @PathVariable Long registrationId, @AuthenticationPrincipal AppUserDetails principal) {
        return paymentService.getForRegistration(registrationId, principal);
    }

    @PostMapping("/registrations/{registrationId}/initiate")
    @PreAuthorize("hasAnyRole('STUDENT', 'AUTHORITY')")
    public PaymentResponse initiate(
            @PathVariable Long registrationId,
            @Valid @RequestBody InitiatePaymentRequest request,
            @AuthenticationPrincipal AppUserDetails principal) {
        return paymentService.initiate(registrationId, request, principal);
    }

    @PostMapping("/{paymentId}/cancel")
    @PreAuthorize("hasAnyRole('STUDENT', 'AUTHORITY')")
    public PaymentResponse cancel(@PathVariable Long paymentId, @AuthenticationPrincipal AppUserDetails principal) {
        return paymentService.cancel(paymentId, principal);
    }
}
