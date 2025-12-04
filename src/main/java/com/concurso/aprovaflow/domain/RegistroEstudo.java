package com.concurso.aprovaflow.domain;

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

    private LocalTime cargaHoraria; // Ex: 01:30:00

    private String tipoEstudo; // Videoaula, PDF, Questões...

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
    
    // Método auxiliar para calcular % de acerto automaticamente se quiser
    public Double getPercentualAcerto() {
        if (questoesFeitas == null || questoesFeitas == 0) return 0.0;
        return (double) questoesCertas / questoesFeitas * 100;
    }
}