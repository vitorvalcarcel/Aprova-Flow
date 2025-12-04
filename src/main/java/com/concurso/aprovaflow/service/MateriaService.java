package com.concurso.aprovaflow.service;

import com.concurso.aprovaflow.model.Materia;
import com.concurso.aprovaflow.repository.MateriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MateriaService {

    @Autowired
    private MateriaRepository repository;

    public List<Materia> listarTodas() {
        return repository.findAll();
    }
}