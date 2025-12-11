package com.careerhoop.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String token; // Access token
    private String refreshToken; // Refresh token
    private UserResponse user;
}


