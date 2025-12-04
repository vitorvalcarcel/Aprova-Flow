package com.concurso.aprovaflow.service;

import com.concurso.aprovaflow.model.Topico;
import com.concurso.aprovaflow.repository.TopicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TopicoService {

    @Autowired
    private TopicoRepository repository;

    public List<Topico> listarTodos() {
        return repository.findAll();
    }

    public Topico salvar(Topico topico) {
        return repository.save(topico);
    }

    public void excluir(Long id) {
        repository.deleteById(id);
    }
}
