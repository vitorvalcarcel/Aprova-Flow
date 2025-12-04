package com.concurso.aprovaflow.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class RegistroDTO {
    private LocalDate data;
    private String cargaHoraria; // Recebe como texto "01:30" e convertemos depois
    private String tipoEstudo;
    private Integer questoesFeitas;
    private Integer questoesCertas;
    private Long materiaId; // Só o ID, não o objeto inteiro
    private Long topicoId;
}