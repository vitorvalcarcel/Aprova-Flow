package com.concurso.aprovaflow.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class RegistroDTO {
    private LocalDate data;
    private LocalTime horaInicio;
    private String cargaHoraria; // Texto "HH:mm"
    private Long tipoEstudoId; // Alterado de String para Long (ID)
    private String anotacoes;
    private Integer questoesFeitas;
    private Integer questoesCertas;
    private Long materiaId;
    private Long topicoId;
    private String topicoNome;
}