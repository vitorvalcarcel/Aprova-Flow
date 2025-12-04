package com.concurso.aprovaflow.dto;

import lombok.Data;
import java.util.List;

@Data
public class DashboardDTO {
    private String totalHorasCiclo; // "12:30"
    private String mensagemMotivacional;
    private List<ResumoMateriaDTO> desempenhoPorMateria;

    @Data
    public static class ResumoMateriaDTO {
        private String nomeMateria;
        private Double percentualAcertos;
        private Integer totalQuestoes;
    }
}