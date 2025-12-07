package com.concurso.aprovaflow.service;

import com.concurso.aprovaflow.model.Ciclo;
import com.concurso.aprovaflow.model.Concurso;
import com.concurso.aprovaflow.model.User;
import com.concurso.aprovaflow.repository.CicloRepository;
import com.concurso.aprovaflow.repository.ConcursoRepository;
import com.concurso.aprovaflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ConcursoService {

    @Autowired
    private ConcursoRepository concursoRepository;

    @Autowired
    private CicloRepository cicloRepository;

    @Autowired
    private UserRepository userRepository;

    private User getUsuarioLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public Optional<Concurso> buscarConcursoAtivo() {
        return concursoRepository.findByAtivoTrueAndUser(getUsuarioLogado());
    }
    
    public Optional<Concurso> buscarPorId(Long id) {
        return concursoRepository.findById(id);
    }

    @Transactional
    public Concurso criarConcurso(com.concurso.aprovaflow.dto.ConcursoDTO dto) {
        User user = getUsuarioLogado();

        // Desativar concursos anteriores DESTE usuário
        List<Concurso> concursos = concursoRepository.findAllByUser(user);
        for (Concurso c : concursos) {
            c.setAtivo(false);
            concursoRepository.save(c);
        }

        // Criar novo concurso vinculado ao usuário
        Concurso novo = new Concurso();
        novo.setNome(dto.getNome());
        novo.setDataProva(dto.getDataProva());
        novo.setCargaHorariaCiclo(dto.getCargaHorariaCiclo());
        novo.setQuestoesIncremento(dto.getQuestoesIncremento());
        novo.setQuestoesMetaInicial(dto.getQuestoesMetaInicial());
        novo.setAtivo(true);
        novo.setUser(user); 
        novo = concursoRepository.save(novo);

        // Não cria Ciclo aqui mais, pois ciclo é calculado dinamicamente ou logado ao fechar.
        // A lógica de Ciclo Calculado NÃO depende de ter um objeto Ciclo aberto no banco.
        // O "Ciclo Atual" é virtual.

        return novo;
    }

    public List<Concurso> listarConcursos() {
        return concursoRepository.findAllByUser(getUsuarioLogado());
    }

    @Transactional
    public void ativarConcurso(Long id) {
        User user = getUsuarioLogado();
        Concurso target = concursoRepository.findById(id)
                .filter(c -> c.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Concurso não encontrado"));

        List<Concurso> all = concursoRepository.findAllByUser(user);
        for (Concurso c : all) {
            c.setAtivo(c.getId().equals(id));
            concursoRepository.save(c);
        }
    }

    @Transactional
    public void excluirConcurso(Long id) {
        User user = getUsuarioLogado();
        Concurso target = concursoRepository.findById(id)
                .filter(c -> c.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Concurso não encontrado ou não pertence ao usuário"));
        
        concursoRepository.delete(target);
    }
    
    @Transactional
    public Concurso atualizarConcurso(Long id, com.concurso.aprovaflow.dto.ConcursoDTO dto) {
        User user = getUsuarioLogado();
        Concurso target = concursoRepository.findById(id)
                .filter(c -> c.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Concurso não encontrado"));

        target.setNome(dto.getNome());
        target.setCargaHorariaCiclo(dto.getCargaHorariaCiclo());
        target.setQuestoesMetaInicial(dto.getQuestoesMetaInicial());
        target.setQuestoesIncremento(dto.getQuestoesIncremento());
        target.setDataProva(dto.getDataProva());
        
        return concursoRepository.save(target);
    }
}