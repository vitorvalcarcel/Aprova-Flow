package com.concurso.aprovaflow.model;

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

    private LocalTime horaInicio; // Novo campo: Hora que começou a estudar

    private LocalTime cargaHoraria; // Ex: 01:30:00 (Duração)

    @ManyToOne
    @JoinColumn(name = "tipo_estudo_id")
    private TipoEstudo tipoEstudo; // Videoaula, PDF, Questões...

    @Column(length = 2000)
    private String anotacoes; // Novo campo: Observações sobre o estudo

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