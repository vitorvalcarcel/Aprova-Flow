package com.concurso.aprovaflow.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class CicloHistorico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ciclo_id")
    private Ciclo ciclo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id")
    private Materia materia;

    // Quanto foi descontado do saldo desta matéria neste ciclo
    private Double horasDescontadas;

    private Integer questoesDescontadas;
}
