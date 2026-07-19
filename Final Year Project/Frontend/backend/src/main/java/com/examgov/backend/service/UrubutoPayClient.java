package com.examgov.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

/**
 * Thin wrapper around UrubutoPay's public payment-collection APIs (Initiate Payment /
 * Verify Transaction Status). Per the integration guide, the API key is sent verbatim in the
 * Authorization header (no "Bearer " prefix) and every response is wrapped in
 * {timestamp, status, message, data}.
 */
@Component
public class UrubutoPayClient {

    private static final Logger log = LoggerFactory.getLogger(UrubutoPayClient.class);

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String merchantCode;
    private final String serviceCode;

    public UrubutoPayClient(
            @Value("${urubutopay.base-url}") String baseUrl,
            @Value("${urubutopay.api-key}") String apiKey,
            @Value("${urubutopay.merchant-code}") String merchantCode,
            @Value("${urubutopay.service-code}") String serviceCode) {
        this.merchantCode = merchantCode;
        this.serviceCode = serviceCode;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Authorization", apiKey)
                .build();
    }

    public InitiateResult initiatePayment(
            String payerCode, String payerNames, String payerEmail, String phoneNumber, int amount,
            String channelName, String transactionId) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("merchant_code", merchantCode);
        body.put("payer_code", payerCode);
        body.put("payer_names", payerNames);
        if (payerEmail != null && !payerEmail.isBlank()) {
            body.put("payer_email", payerEmail);
        }
        body.put("phone_number", phoneNumber);
        body.put("amount", amount);
        body.put("channel_name", channelName);
        body.put("transaction_id", transactionId);
        body.put("service_code", serviceCode);

        try {
            String responseBody = restClient.post()
                    .uri("/api/v2/payment/initiate")
                    .body(body)
                    .retrieve()
                    .body(String.class);
            JsonNode json = objectMapper.readTree(responseBody);
            JsonNode data = json.path("data");
            return new InitiateResult(
                    true,
                    textOrNull(data, "transaction_status"),
                    textOrNull(data, "internal_transaction_ref_number"),
                    textOrNull(json, "message"),
                    200);
        } catch (RestClientResponseException ex) {
            log.warn("UrubutoPay initiate-payment failed: {} {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            return new InitiateResult(false, null, null, extractMessage(ex.getResponseBodyAsString()), ex.getStatusCode().value());
        } catch (Exception ex) {
            log.error("UrubutoPay initiate-payment could not be reached", ex);
            return new InitiateResult(false, null, null, "Could not reach the payment gateway. Please try again.", 0);
        }
    }

    public StatusResult verifyTransactionStatus(String transactionId) {
        Map<String, Object> body = Map.of(
                "merchant_code", merchantCode,
                "transaction_id", transactionId);

        try {
            String responseBody = restClient.post()
                    .uri("/api/v2/payment/transaction/status")
                    .body(body)
                    .retrieve()
                    .body(String.class);
            JsonNode json = objectMapper.readTree(responseBody);
            JsonNode data = json.path("data");
            return new StatusResult(
                    true,
                    textOrNull(data, "transaction_status"),
                    textOrNull(data, "internal_transaction_id"),
                    textOrNull(json, "message"),
                    200);
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode().value() == 404) {
                return new StatusResult(true, null, null, "Not yet found at gateway", 404);
            }
            log.warn("UrubutoPay verify-status failed: {} {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            return new StatusResult(false, null, null, extractMessage(ex.getResponseBodyAsString()), ex.getStatusCode().value());
        } catch (Exception ex) {
            log.error("UrubutoPay verify-status could not be reached", ex);
            return new StatusResult(false, null, null, "Could not reach the payment gateway.", 0);
        }
    }

    private String textOrNull(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return value.isMissingNode() || value.isNull() ? null : value.asText();
    }

    private String extractMessage(String body) {
        if (body == null || body.isBlank()) {
            return "Payment gateway error";
        }
        try {
            return objectMapper.readTree(body).path("message").asText("Payment gateway error");
        } catch (Exception e) {
            return "Payment gateway error";
        }
    }

    public record InitiateResult(
            boolean requestSucceeded, String transactionStatus, String internalTransactionRefNumber, String message,
            int httpStatus) {
    }

    public record StatusResult(
            boolean requestSucceeded, String transactionStatus, String internalTransactionId, String message,
            int httpStatus) {
    }
}
