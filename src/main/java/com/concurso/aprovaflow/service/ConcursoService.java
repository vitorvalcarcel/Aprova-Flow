package com.concurso.aprovaflow.service;

import com.concurso.aprovaflow.model.Ciclo;
import com.concurso.aprovaflow.model.Concurso;
import com.concurso.aprovaflow.repository.CicloRepository;
import com.concurso.aprovaflow.repository.ConcursoRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    public Optional<Concurso> buscarConcursoAtivo() {
        return concursoRepository.findByAtivoTrue();
    }

    @Transactional
    public Concurso criarConcurso(String nome) {
        // Desativar concursos anteriores
        List<Concurso> concursos = concursoRepository.findAll();
        for (Concurso c : concursos) {
            c.setAtivo(false);
            concursoRepository.save(c);
        }

        // Criar novo concurso
        Concurso novo = new Concurso();
        novo.setNome(nome);
        novo.setAtivo(true);
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
