package com.concurso.aprovaflow.dto;

import com.concurso.aprovaflow.model.Materia;
import lombok.Data;

@Data
public class MateriaCicloDTO {
    
    // Identificação
    private Long materiaId;
    private String nomeMateria;
    
    // Configuração
    private Double peso;
    private Double metaHoras;
    
    // Status
    private Double horasEstudadasTotal;  // Total geral no concurso
    private Double horasDescontadas;     // Já consumidas em ciclos anteriores
    private Double saldoAtual;           // Estudadas - Descontadas
    
    // Métrica
    private Double progresso;            // (Saldo / Meta) * 100
    
    // Auxiliar para ordenação visual
    private Integer ordem;

    // Construtor utilitário
    public MateriaCicloDTO(Materia materia, Double peso, Double metaHoras, Double horasEstudadas, Double horasDescontadas, Integer ordem) {
        this.materiaId = materia.getId();
        this.nomeMateria = materia.getNome();
        this.peso = peso;
        this.metaHoras = metaHoras;
        this.horasEstudadasTotal = horasEstudadas;
        this.horasDescontadas = horasDescontadas;
        this.ordem = ordem;
        
        // Cálculos
        this.saldoAtual = Math.max(0, horasEstudadas - horasDescontadas);
        
        if (metaHoras > 0) {
            this.progresso = (this.saldoAtual / metaHoras) * 100;
        } else {
            this.progresso = 0.0;
        }
    }
}
