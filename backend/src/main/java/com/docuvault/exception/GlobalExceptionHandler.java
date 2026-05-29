package com.docuvault.exception;

import com.docuvault.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Object>> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.error("File size limits exceeded! Maximum size allowed is 50MB per file/request.", 400));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgument(IllegalArgumentException exc) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(exc.getMessage(), 400));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneralException(Exception exc) {
        return ResponseEntity.status(500)
                .body(ApiResponse.error("An internal server error occurred: " + exc.getMessage(), 500));
    }
}
