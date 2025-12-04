package com.concurso.aprovaflow.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class HeartbeatService {

    private LocalDateTime lastHeartbeat = LocalDateTime.now();

    public void beat() {
        this.lastHeartbeat = LocalDateTime.now();
    }

    @Scheduled(fixedRate = 5000) // Verifica a cada 5 segundos
    public void checkHeartbeat() {
        long secondsSinceLast = ChronoUnit.SECONDS.between(lastHeartbeat, LocalDateTime.now());
        
        // Se passar de 15 segundos sem sinal, encerra
        if (secondsSinceLast > 15) {
            System.out.println("Sem sinal do frontend por " + secondsSinceLast + " segundos. Encerrando aplicação...");
            System.exit(0);
        }
    }
}
