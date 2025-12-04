package com.concurso.aprovaflow.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class RegistroDTO {
    private LocalDate data;
    private LocalTime horaInicio; // Novo
    private String cargaHoraria; // Texto "HH:mm"
    private String tipoEstudo;
    private String anotacoes; // Novo
    private Integer questoesFeitas;
    private Integer questoesCertas;
    private Long materiaId;
    private Long topicoId;
}