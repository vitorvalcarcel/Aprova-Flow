package com.concurso.aprovaflow.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Topico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer numeroEdital;

    @Column(length = 1000)
    private String descricao;

    @ManyToOne
    @JoinColumn(name = "materia_id")
    @JsonIgnoreProperties("topicos")
    private Materia materia;
}