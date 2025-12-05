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

import java.util.Optional;

@Service
public class CicloService {

    @Autowired
    private CicloRepository cicloRepository;

    @Autowired
    private ConcursoRepository concursoRepository;

    @Autowired
    private UserRepository userRepository;

    private User getUsuarioLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public Ciclo buscarCicloAtivo() {
        // Correção: Agora buscamos o concurso ativo DO USUÁRIO LOGADO
        Optional<Concurso> concursoAtivo = concursoRepository.findByAtivoTrueAndUser(getUsuarioLogado());

        if (concursoAtivo.isEmpty()) {
            return null;
        }

        // Se achou o concurso do usuário, busca o ciclo ativo dele
        return cicloRepository.findByConcursoAndAtivoTrue(concursoAtivo.get())
                .orElse(null);
    }
}