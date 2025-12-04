package com.concurso.aprovaflow.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
public class Materia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome; // Ex: Tecnologia da Informação

    private Double peso; // Ex: 1.5

    private Integer qtdQuestoesProva; // Ex: 35

    @ManyToOne
    @JoinColumn(name = "concurso_id")
    @JsonIgnore // Evita loop infinito ao gerar JSON
    private Concurso concurso;

    @OneToMany(mappedBy = "materia", cascade = CascadeType.ALL)
    private List<Topico> topicos = new ArrayList<>();
}