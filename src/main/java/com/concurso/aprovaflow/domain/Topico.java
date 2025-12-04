package com.concurso.aprovaflow.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Topico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer numeroEdital; // Ex: 1, 2, 3...

    @Column(length = 1000) // Aumenta o tamanho para caber descrições grandes do edital
    private String descricao;

    @ManyToOne
    @JoinColumn(name = "materia_id")
    @JsonIgnore
    private Materia materia;
}