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

    // Controle de Questões
    private Double metaQuestoes;
    private Integer questoesFeitasTotal;
    private Integer questoesDescontadas;
    private Double saldoQuestoes;        // Feitas - Descontadas. Double para comparar com Meta (que é double devido a peso)
    private Double progressoQuestoes;
    
    // Auxiliar para ordenação visual
    private Integer ordem;

    // Construtor utilitário
    public MateriaCicloDTO(Materia materia, Double peso, Double metaHoras, Double horasEstudadas, Double horasDescontadas, 
                           Double metaQuestoes, Integer questoesFeitas, Integer questoesDescontadas, Integer ordem) {
        this.materiaId = materia.getId();
        this.nomeMateria = materia.getNome();
        this.peso = peso;
        this.metaHoras = metaHoras;
        this.horasEstudadasTotal = horasEstudadas;
        this.horasDescontadas = horasDescontadas;
        this.ordem = ordem;
        
        // Dados Questões
        this.metaQuestoes = metaQuestoes;
        this.questoesFeitasTotal = questoesFeitas;
        this.questoesDescontadas = questoesDescontadas;

        // Cálculos Horas
        this.saldoAtual = Math.max(0, horasEstudadas - horasDescontadas);
        if (metaHoras > 0) {
            this.progresso = (this.saldoAtual / metaHoras) * 100;
        } else {
            this.progresso = 0.0;
        }

        // Cálculos Questões
        // saldo = feitas - descontadas. 
        // Cast to double for consistency
        double saldoQ = Math.max(0, (double)questoesFeitas - (double)questoesDescontadas);
        this.saldoQuestoes = saldoQ;

        if (metaQuestoes > 0) {
            this.progressoQuestoes = (saldoQ / metaQuestoes) * 100;
        } else {
            this.progressoQuestoes = 0.0;
        }
    }
}
