package com.concurso.aprovaflow.service;

import com.concurso.aprovaflow.model.Ciclo;
import com.concurso.aprovaflow.model.Concurso;
import com.concurso.aprovaflow.repository.CicloRepository;
import com.concurso.aprovaflow.repository.ConcursoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CicloService {

    @Autowired
    private CicloRepository cicloRepository;

    @Autowired
    private ConcursoRepository concursoRepository;

    public Ciclo buscarCicloAtivo() {
        Optional<Concurso> concursoAtivo = concursoRepository.findByAtivoTrue();
        
        if (concursoAtivo.isEmpty()) {
            // Se não tem concurso ativo, não tem ciclo ativo.
            // Retornamos null ou lançamos erro específico.
            // O frontend deve tratar isso chamando o endpoint de verificação de concurso.
            return null; 
        }

        return cicloRepository.findByConcursoAndAtivoTrue(concursoAtivo.get())
                .orElse(null); // Retorna null se não achar, ao invés de erro 500
    }
}