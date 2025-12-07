package com.concurso.aprovaflow.service;

import com.concurso.aprovaflow.dto.CicloAtualDTO;
import com.concurso.aprovaflow.dto.MateriaCicloDTO;
import com.concurso.aprovaflow.model.*;
import com.concurso.aprovaflow.repository.CicloHistoricoRepository;
import com.concurso.aprovaflow.repository.CicloRepository;
import com.concurso.aprovaflow.repository.ConcursoMateriaRepository;
import com.concurso.aprovaflow.repository.RegistroEstudoRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CicloService {

    @Autowired
    private CicloRepository cicloRepository;

    @Autowired
    private CicloHistoricoRepository cicloHistoricoRepository;

    @Autowired
    private ConcursoMateriaRepository concursoMateriaRepository;

    @Autowired
    private RegistroEstudoRepository registroEstudoRepository;

    public CicloAtualDTO getDadosCicloAtual(Concurso concurso) {
        if (concurso == null) return null;

        // 1. Configurações
        Double cargaHorariaCiclo = concurso.getCargaHorariaCiclo() != null ? concurso.getCargaHorariaCiclo() : 24.0;
        List<ConcursoMateria> configMaterias = concursoMateriaRepository.findByConcurso(concurso);
        
        if (configMaterias.isEmpty()) {
            // Se não tem matérias configuradas, retorna DTO vazio
             CicloAtualDTO dto = new CicloAtualDTO();
             dto.setConcursoId(concurso.getId());
             dto.setNomeConcurso(concurso.getNome());
             dto.setCargaHorariaCiclo(cargaHorariaCiclo);
             dto.setMaterias(new ArrayList<>());
             dto.setTotalHorasEstudadasCiclo(0.0);
             dto.setProgressoGeral(0.0);
             return dto;
        }

        // Soma total dos pesos
        double somaPesos = configMaterias.stream()
                .mapToDouble(cm -> cm.getPeso() != null ? cm.getPeso() : 0.0)
                .sum();
        
        if (somaPesos == 0) somaPesos = 1.0; // Evitar divisão por zero

        // 1.1 Calcular Meta de Questões do Ciclo Atual
        // Meta = Inicial + (Incremento * nrCiclosFechados)
        // Precisamos saber quantos ciclos foram fechados para calcular o incremento
        // A query de ciclosFechados vem abaixo, vamos antecipar ou usar a lista depois.
        // Vamos mover a busca de ciclosFechados para CIMA.

        List<Ciclo> ciclosFechados = cicloRepository.findAllByConcurso(concurso);
        List<Long> ciclosIds = ciclosFechados.stream().map(Ciclo::getId).toList();

        // 2. Calcular Meta de Questões para este ciclo
        int metaBase = concurso.getQuestoesMetaInicial() != null ? concurso.getQuestoesMetaInicial() : 0;
        int incremento = concurso.getQuestoesIncremento() != null ? concurso.getQuestoesIncremento() : 0;
        int numeroCiclos = ciclosIds.size(); // Ciclos já fechados
        double metaQuestoesCiclo = metaBase + (incremento * numeroCiclos);
        
        // 3. Buscar dados brutos
        List<RegistroEstudo> registroEstudos = registroEstudoRepository.findByConcursoId(concurso.getId());
        
        List<CicloHistorico> historicos = new ArrayList<>();
        if (!ciclosIds.isEmpty()) {
            for (Ciclo c : ciclosFechados) {
                historicos.addAll(cicloHistoricoRepository.findByCicloId(c.getId()));
            }
        }

        // 3. Agregar Horas Estudadas e Descontadas por Matéria
        Map<Long, Double> horasEstudadasMap = registroEstudos.stream()
                .filter(r -> r.getMateria() != null && r.getCargaHoraria() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getMateria().getId(),
                        Collectors.summingDouble(r -> {
                            Duration d = Duration.between(java.time.LocalTime.MIN, r.getCargaHoraria());
                            return d.toMinutes() / 60.0;
                        })
                ));

        Map<Long, Double> horasDescontadasMap = historicos.stream()
                .filter(h -> h.getMateria() != null && h.getHorasDescontadas() != null)
                .collect(Collectors.groupingBy(
                        h -> h.getMateria().getId(),
                        Collectors.summingDouble(CicloHistorico::getHorasDescontadas)
                ));

        Map<Long, Integer> questoesFeitasMap = registroEstudos.stream()
                .filter(r -> r.getMateria() != null && r.getQuestoesFeitas() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getMateria().getId(),
                        Collectors.summingInt(RegistroEstudo::getQuestoesFeitas)
                ));

        Map<Long, Integer> questoesDescontadasMap = historicos.stream()
                .filter(h -> h.getMateria() != null && h.getQuestoesDescontadas() != null)
                .collect(Collectors.groupingBy(
                        h -> h.getMateria().getId(),
                        Collectors.summingInt(CicloHistorico::getQuestoesDescontadas)
                ));

        // 4. Montar DTOs das matérias
        List<MateriaCicloDTO> materiaDTOs = new ArrayList<>();
        double somaPesosFinal = somaPesos;

        for (ConcursoMateria cm : configMaterias) {
            Double peso = cm.getPeso() != null ? cm.getPeso() : 0.0;
            Double metaHoras;
            
            if (cm.getHorasCiclo() != null && cm.getHorasCiclo() > 0) {
                 metaHoras = cm.getHorasCiclo();
            } else {
                 metaHoras = (peso / somaPesosFinal) * cargaHorariaCiclo;
            }
            Double metaQuestoesMat = (peso / somaPesosFinal) * metaQuestoesCiclo;
            
            Double totalEstudado = horasEstudadasMap.getOrDefault(cm.getMateria().getId(), 0.0);
            Double totalDescontado = horasDescontadasMap.getOrDefault(cm.getMateria().getId(), 0.0);

            Integer totalQFeitas = questoesFeitasMap.getOrDefault(cm.getMateria().getId(), 0);
            Integer totalQDescontadas = questoesDescontadasMap.getOrDefault(cm.getMateria().getId(), 0);
            
            materiaDTOs.add(new MateriaCicloDTO(
                    cm.getId(),
                    cm.getMateria(),
                    peso,
                    metaHoras,
                    totalEstudado,
                    totalDescontado,
                    metaQuestoesMat,
                    totalQFeitas,
                    totalQDescontadas,
                    cm.getOrdem() != null ? cm.getOrdem() : 999,
                    cm.getQuestoesProva()
            ));
        }
        
        // Ordenar por ordem definida
        materiaDTOs.sort(Comparator.comparingInt(MateriaCicloDTO::getOrdem));

        // 5. Montar DTO Final
        CicloAtualDTO cicloDTO = new CicloAtualDTO();
        cicloDTO.setConcursoId(concurso.getId());
        cicloDTO.setNomeConcurso(concurso.getNome());
        cicloDTO.setCargaHorariaCiclo(cargaHorariaCiclo);
        cicloDTO.setMaterias(materiaDTOs);
        
        // Totais
        double totalSaldo = materiaDTOs.stream().mapToDouble(MateriaCicloDTO::getSaldoAtual).sum();
        cicloDTO.setTotalHorasEstudadasCiclo(totalSaldo);
        
        // Progresso Geral (Média ponderada ou simples dos progressos? Ou Total Saldo / Total Carga?)
        // Vamos usar Total Saldo / Total Carga
        cicloDTO.setProgressoGeral(Math.min(100.0, (totalSaldo / cargaHorariaCiclo) * 100));
        
        return cicloDTO;
    }

    @Transactional
    public void fecharCiclo(Concurso concurso) {
        CicloAtualDTO dadosAtuais = getDadosCicloAtual(concurso);
        
        // Validação: Todas as matérias atingiram a meta?
        boolean horasOk = dadosAtuais.getMaterias().stream()
                .allMatch(m -> m.getSaldoAtual() >= m.getMetaHoras() - 0.01); // 0.01 tolerância float
        
        boolean questoesOk = dadosAtuais.getMaterias().stream()
                .allMatch(m -> m.getSaldoQuestoes() >= m.getMetaQuestoes() - 0.5); // 0.5 tolerância arredondamento no double

        if (!horasOk) {
            throw new RuntimeException("Não é possível fechar o ciclo. Meta de HORAS não atingida em todas as matérias.");
        }
        if (!questoesOk) {
            throw new RuntimeException("Não é possível fechar o ciclo. Meta de QUESTÕES não atingida em todas as matérias.");
        }

        // Criar Novo Ciclo Arquivado
        Ciclo novoCiclo = new Ciclo();
        novoCiclo.setConcurso(concurso);
        novoCiclo.setDataFechamento(LocalDate.now());
        novoCiclo.setDataInicio(LocalDate.now()); // Dado nao persistido antes, assumindo hoje como fim e "ref de inicio"
        
        // Calcular número do ciclo
        List<Ciclo> ciclosAntigos = cicloRepository.findAllByConcurso(concurso);
        novoCiclo.setNumero(ciclosAntigos.size() + 1);
        novoCiclo.setAtivo(false); // Ciclos arquivados não são "ativos" no sentido de "abertos", pois o aberto é voltátil
        novoCiclo.setHorasTotais(dadosAtuais.getCargaHorariaCiclo());
        
        cicloRepository.save(novoCiclo);

        // Criar Hitórico de Descontos
        for (MateriaCicloDTO mDTO : dadosAtuais.getMaterias()) {
            CicloHistorico hist = new CicloHistorico();
            hist.setCiclo(novoCiclo);
            
            // Recarregar entidade materia só pra garantir vínculo (ou usar a ref do DTO se tivesse entidade)
            // Aqui vamos assumir que o ID do DTO é real.
            // Para ser JPA compliance, melhor buscar a ref. ou usar `getReference`
            Materia matRef = new Materia(); 
            matRef.setId(mDTO.getMateriaId());
            hist.setMateria(matRef);
            
            // O desconto é EXATAMENTE a META. O excedente fica como saldo inicial do próximo (automaticamente pelo calculo de subtração)
            hist.setHorasDescontadas(mDTO.getMetaHoras()); 
            
            // Questões: descontamos também a meta (arredondada, já que no historico é Integer)
            // Se a meta for 33.3, arredondamos para 33. Se for 33.7, para 34.
            hist.setQuestoesDescontadas((int) Math.round(mDTO.getMetaQuestoes()));
            
            cicloHistoricoRepository.save(hist);
        }
        
        // TODO: Atualizar concurso se tiver incremento de questões ou carga horária (Regra 2 da Parte 1, mas opcional agora)
    }
}