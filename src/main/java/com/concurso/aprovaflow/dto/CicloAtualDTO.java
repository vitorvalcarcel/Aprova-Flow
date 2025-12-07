package com.concurso.aprovaflow.dto;

import lombok.Data;
import java.util.List;

@Data
public class CicloAtualDTO {
    
    private Long concursoId;
    private String nomeConcurso;
    
    private Double cargaHorariaCiclo;
    private Double totalHorasEstudadasCiclo; // Soma dos saldos das matérias
    
    private Double progressoGeral; // Média ou cálculo global do ciclo
    
    private List<MateriaCicloDTO> materias;
}
