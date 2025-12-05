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

    @Transactional
    public Concurso criarConcurso(String nome) {
        User user = getUsuarioLogado();

        // Desativar concursos anteriores DESTE usuário
        List<Concurso> concursos = concursoRepository.findAllByUser(user);
        for (Concurso c : concursos) {
            c.setAtivo(false);
            concursoRepository.save(c);
        }

        // Criar novo concurso vinculado ao usuário
        Concurso novo = new Concurso();
        novo.setNome(nome);
        novo.setAtivo(true);
        novo.setUser(user); // Vincula ao usuário
        novo = concursoRepository.save(novo);

        // Criar Ciclo 1 automaticamente
        Ciclo ciclo1 = new Ciclo();
        ciclo1.setNumero(1);
        ciclo1.setHorasTotais(0.0);
        ciclo1.setAtivo(true);
        ciclo1.setConcurso(novo);
        cicloRepository.save(ciclo1);

        return novo;
    }
}