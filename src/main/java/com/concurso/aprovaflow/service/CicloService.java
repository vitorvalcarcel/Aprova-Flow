package com.concurso.aprovaflow.service;

import com.concurso.aprovaflow.model.Ciclo;
import com.concurso.aprovaflow.repository.CicloRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CicloService {

    @Autowired
    private CicloRepository repository;

    public Ciclo buscarCicloAtivo() {
        return repository.findByAtivoTrue()
                .orElseThrow(() -> new RuntimeException("Nenhum ciclo ativo encontrado!"));
    }
    
    // Futuramente podemos adicionar métodos para fechar ciclo e abrir um novo
}