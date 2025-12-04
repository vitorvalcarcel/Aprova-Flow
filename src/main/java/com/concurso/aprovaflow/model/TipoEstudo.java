package com.concurso.aprovaflow.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class TipoEstudo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome; // Ex: Videoaula, PDF, Questões...
}
