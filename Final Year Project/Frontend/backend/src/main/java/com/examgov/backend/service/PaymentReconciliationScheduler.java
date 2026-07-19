package com.examgov.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PaymentReconciliationScheduler {

    private static final Logger log = LoggerFactory.getLogger(PaymentReconciliationScheduler.class);

    private final PaymentService paymentService;

    public PaymentReconciliationScheduler(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @Scheduled(fixedRate = 60_000)
    public void reconcilePendingPayments() {
        try {
            paymentService.reconcilePendingPayments();
        } catch (Exception e) {
            log.error("Payment reconciliation run failed", e);
        }
    }
}
