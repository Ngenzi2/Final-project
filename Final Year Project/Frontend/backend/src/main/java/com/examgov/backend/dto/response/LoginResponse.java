package com.examgov.backend.dto.response;

public record LoginResponse(String token, UserResponse user) {
}
