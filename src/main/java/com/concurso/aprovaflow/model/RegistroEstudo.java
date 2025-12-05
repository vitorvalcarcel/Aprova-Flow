package com.concurso.aprovaflow.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Entity
public class RegistroEstudo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate data;

    private LocalTime horaInicio;

    private LocalTime cargaHoraria;

    @ManyToOne
    @JoinColumn(name = "tipo_estudo_id")
    private TipoEstudo tipoEstudo;

    @Column(length = 2000)
    private String anotacoes;

    private Integer questoesFeitas;
    
    private Integer questoesCertas;
    
    private Integer questoesErradas;

    @ManyToOne
    @JoinColumn(name = "materia_id")
    private Materia materia;

    @ManyToOne
    @JoinColumn(name = "topico_id")
    private Topico topico;

    @ManyToOne
    @JoinColumn(name = "ciclo_id")
    private Ciclo ciclo;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    public Double getPercentualAcerto() {
        if (questoesFeitas == null || questoesFeitas == 0) return 0.0;
        return (double) questoesCertas / questoesFeitas * 100;
    }
}