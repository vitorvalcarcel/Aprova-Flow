package com.concurso.aprovaflow.dto;

import lombok.Data;

public class AuthDtos {
    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class SignUpRequest {
        private String username;
        private String password;
    }

    @Data
    public static class JwtAuthenticationResponse {
        private String accessToken;
        private String tokenType = "Bearer";

        public JwtAuthenticationResponse(String accessToken) {
            this.accessToken = accessToken;
        }
    }
}
