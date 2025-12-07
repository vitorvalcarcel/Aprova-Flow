package com.concurso.aprovaflow.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ConcursoDTO {
    private String nome;
    private LocalDate dataProva;
    
    // Configurações do Ciclo
    private Double cargaHorariaCiclo;
    private Integer questoesIncremento;
    private Integer questoesMetaInicial;
}
