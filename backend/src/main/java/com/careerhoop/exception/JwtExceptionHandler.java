package com.careerhoop.exception;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class JwtExceptionHandler {

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<Map<String, String>> handleExpiredJwtException(ExpiredJwtException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Token expired");
        error.put("message", "JWT token has expired. Please refresh your token.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(MalformedJwtException.class)
    public ResponseEntity<Map<String, String>> handleMalformedJwtException(MalformedJwtException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Invalid token");
        error.put("message", "JWT token is malformed or invalid.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(SignatureException.class)
    public ResponseEntity<Map<String, String>> handleSignatureException(SignatureException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Invalid token signature");
        error.put("message", "JWT token signature does not match.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
}

