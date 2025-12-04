package com.concurso.aprovaflow.service;

import com.concurso.aprovaflow.model.Ciclo;
import com.concurso.aprovaflow.model.RegistroEstudo;
import com.concurso.aprovaflow.repository.RegistroEstudoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalTime;
import java.util.List;

@Service
public class RegistroEstudoService {

    @Autowired
    private RegistroEstudoRepository repository;

    @Autowired
    private CicloService cicloService;

    // Salva o estudo e já vincula ao ciclo atual automaticamente
    public RegistroEstudo registrar(RegistroEstudo novoRegistro) {
        Ciclo cicloAtual = cicloService.buscarCicloAtivo();
        novoRegistro.setCiclo(cicloAtual);
        
        // Validação simples (Regra de Negócio)
        if (novoRegistro.getQuestoesFeitas() != null && novoRegistro.getQuestoesFeitas() > 0) {
            int total = novoRegistro.getQuestoesCertas() + novoRegistro.getQuestoesErradas();
            if (total != novoRegistro.getQuestoesFeitas()) {
                throw new IllegalArgumentException("A soma de certas + erradas não bate com o total feito!");
            }
        }
        
        return repository.save(novoRegistro);
    }

    public List<RegistroEstudo> listarDoCicloAtual() {
        Ciclo cicloAtual = cicloService.buscarCicloAtivo();
        return repository.findByCicloId(cicloAtual.getId());
    }

    // Calcula quantas horas (em formato texto HH:mm) você já estudou no ciclo
    public String calcularTotalHorasCiclo() {
        List<RegistroEstudo> registros = listarDoCicloAtual();
        
        Duration totalDuration = Duration.ZERO;
        
        for (RegistroEstudo r : registros) {
            LocalTime tempo = r.getCargaHoraria();
            totalDuration = totalDuration.plusHours(tempo.getHour())
                                         .plusMinutes(tempo.getMinute())
                                         .plusSeconds(tempo.getSecond());
        }

        long horas = totalDuration.toHours();
        long minutos = totalDuration.toMinutesPart();
        
        return String.format("%02d:%02d", horas, minutos);
    }
}