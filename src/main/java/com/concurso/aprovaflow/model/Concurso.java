package com.concurso.aprovaflow.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data // Gera Getters, Setters, toString, etc. automaticamente
@Entity
public class Concurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome; // Ex: Banco do Brasil 2026

    private LocalDate dataProva;

    @OneToMany(mappedBy = "concurso", cascade = CascadeType.ALL)
    private List<Materia> materias = new ArrayList<>();
}