package com.concurso.aprovaflow.service;

import com.concurso.aprovaflow.model.Ciclo;
import com.concurso.aprovaflow.model.RegistroEstudo;
import com.concurso.aprovaflow.model.User;
import com.concurso.aprovaflow.repository.RegistroEstudoRepository;
import com.concurso.aprovaflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
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
    
    @Autowired
    private UserRepository userRepository;

    private User getUsuarioLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @Autowired
    private com.concurso.aprovaflow.repository.ConcursoRepository concursoRepository;

    public RegistroEstudo registrar(RegistroEstudo novoRegistro) {
        User user = getUsuarioLogado();
        
        // Busca concurso ativo do usuário
        com.concurso.aprovaflow.model.Concurso concursoAtivo = concursoRepository.findByAtivoTrueAndUser(user)
                .orElseThrow(() -> new RuntimeException("Nenhum concurso ativo encontrado para registrar o estudo!"));
        
        novoRegistro.setConcurso(concursoAtivo);
        novoRegistro.setUser(user);
        
        if (novoRegistro.getQuestoesFeitas() != null && novoRegistro.getQuestoesFeitas() > 0) {
            int total = (novoRegistro.getQuestoesCertas() != null ? novoRegistro.getQuestoesCertas() : 0) 
                      + (novoRegistro.getQuestoesErradas() != null ? novoRegistro.getQuestoesErradas() : 0);
            if (total != novoRegistro.getQuestoesFeitas()) {
                throw new IllegalArgumentException("A soma de certas + erradas não bate com o total feito!");
            }
        }
        
        return repository.save(novoRegistro);
    }

    public List<RegistroEstudo> listarDoCicloAtual() {
        User user = getUsuarioLogado();
        return concursoRepository.findByAtivoTrueAndUser(user)
                .map(c -> repository.findByConcursoIdAndUser(c.getId(), user))
                .orElse(List.of());
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

    // --- CORREÇÃO AQUI: Mudamos para receber List<Long> ---
    public List<RegistroEstudo> listarComFiltros(List<Long> materiaIds, List<Long> topicoIds, Long tipoEstudoId, java.time.LocalDate dataInicio, java.time.LocalDate dataFim) {
        // Verifica se as listas estão vazias e passa null para o repositório ignorar o filtro se necessário
        List<Long> mIds = (materiaIds != null && !materiaIds.isEmpty()) ? materiaIds : null;
        List<Long> tIds = (topicoIds != null && !topicoIds.isEmpty()) ? topicoIds : null;

        return repository.findWithFilters(getUsuarioLogado().getId(), mIds, tIds, tipoEstudoId, dataInicio, dataFim);
    }

    public RegistroEstudo buscarPorId(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Registro não encontrado"));
    }

    public RegistroEstudo atualizar(RegistroEstudo registro) {
        if(registro.getUser() == null) {
            registro.setUser(getUsuarioLogado());
        }
        return repository.save(registro);
    }

    public void excluir(Long id) {
        repository.deleteById(id);
    }
}