package com.examgov.backend.dto.response;

import java.util.List;

public record BulkImportResponse(List<StudentResponse> created, List<RowError> errors) {

    public record RowError(int row, String message) {
    }
}
