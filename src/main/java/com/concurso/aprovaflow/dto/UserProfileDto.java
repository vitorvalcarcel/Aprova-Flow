package com.concurso.aprovaflow.dto;

import lombok.Data;

@Data
public class UserProfileDto {
    private String name;
    private String email;
    private String password; // Optional: only if updating
}
