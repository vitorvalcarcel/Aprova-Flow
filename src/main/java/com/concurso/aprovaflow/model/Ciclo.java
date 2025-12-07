package com.concurso.aprovaflow.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
public class Ciclo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer numero; // Ciclo 1, Ciclo 2...

    private Double horasTotais; // Ex: 12.0
    
    private LocalDate dataInicio;
    
    private LocalDate dataFechamento;
    
    private boolean ativo; // Indica se este é o ciclo ATUALMENTE em aberto (logicamente apenas um deve estar ativo por concurso, ou nenhum se todos fechados)

    @ManyToOne
    @JoinColumn(name = "concurso_id")
    private Concurso concurso;
}