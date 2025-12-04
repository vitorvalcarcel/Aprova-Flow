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

    public RegistroEstudo registrar(RegistroEstudo novoRegistro) {
        Ciclo cicloAtual = cicloService.buscarCicloAtivo();
        novoRegistro.setCiclo(cicloAtual);
        
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
        if (cicloAtual == null) {
            return List.of(); // Retorna lista vazia se não houver ciclo ativo
        }
        return repository.findByCicloId(cicloAtual.getId());
    }

    public String calcularTotalHorasCiclo() {
        List<RegistroEstudo> registros = listarDoCicloAtual();
        
        if (registros.isEmpty()) {
            return "00:00";
        }
        
        Duration totalDuration = Duration.ZERO;
        
        for (RegistroEstudo r : registros) {
            LocalTime tempo = r.getCargaHoraria();
            if (tempo != null) {
                totalDuration = totalDuration.plusHours(tempo.getHour())
                                             .plusMinutes(tempo.getMinute())
                                             .plusSeconds(tempo.getSecond());
            }
        }

        long horas = totalDuration.toHours();
        long minutos = totalDuration.toMinutesPart();
        
        return String.format("%02d:%02d", horas, minutos);
    }

    public List<RegistroEstudo> listarComFiltros(Long materiaId, Long topicoId, Long tipoEstudoId, java.time.LocalDate dataInicio, java.time.LocalDate dataFim) {
        return repository.findWithFilters(materiaId, topicoId, tipoEstudoId, dataInicio, dataFim);
    }

    public RegistroEstudo buscarPorId(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Registro não encontrado"));
    }

    public RegistroEstudo atualizar(RegistroEstudo registro) {
        return repository.save(registro);
    }

    public void excluir(Long id) {
        repository.deleteById(id);
    }
}