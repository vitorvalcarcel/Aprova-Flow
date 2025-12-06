package com.concurso.aprovaflow.controller;

import com.concurso.aprovaflow.dto.UserProfileDto;
import com.concurso.aprovaflow.model.User;
import com.concurso.aprovaflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        return userRepository.findByEmail(email)
                .map(user -> {
                    UserProfileDto dto = new UserProfileDto();
                    dto.setName(user.getName());
                    dto.setEmail(user.getEmail());
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@RequestBody UserProfileDto dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        return userRepository.findByEmail(email)
                .map(user -> {
                    if (dto.getName() != null) {
                        user.setName(dto.getName());
                    }
                    if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
                        String passwordPattern = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?=\\S+$).{8,}$";
                        if (!dto.getPassword().matches(passwordPattern)) {
                            return new ResponseEntity<>("Senha fraca! Mínimo 8 caracteres, maiúscula, minúscula, número e especial.", HttpStatus.BAD_REQUEST);
                        }
                        user.setPassword(passwordEncoder.encode(dto.getPassword()));
                    }
                    userRepository.save(user);
                    return ResponseEntity.ok("Perfil atualizado com sucesso!");
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}
