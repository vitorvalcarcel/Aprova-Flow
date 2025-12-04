package com.concurso.aprovaflow.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Ciclo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer numero; // Ciclo 1, Ciclo 2...

    private Double horasTotais; // Ex: 12.0
    
    private boolean ativo; // Para saber qual é o ciclo atual

    @ManyToOne
    @JoinColumn(name = "concurso_id")
    private Concurso concurso;
}