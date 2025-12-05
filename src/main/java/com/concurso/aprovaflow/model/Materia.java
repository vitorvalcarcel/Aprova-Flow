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

    private String nome;

    private Double peso;

    private Integer qtdQuestoesProva;

    @ManyToOne
    @JoinColumn(name = "concurso_id")
    @JsonIgnore
    private Concurso concurso;

    @OneToMany(mappedBy = "materia", cascade = CascadeType.ALL)
    private List<Topico> topicos = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
}