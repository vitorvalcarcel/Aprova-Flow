package com.concurso.aprovaflow.service;

import com.concurso.aprovaflow.model.Materia;
import com.concurso.aprovaflow.model.RegistroEstudo;
import com.concurso.aprovaflow.repository.MateriaRepository;
import com.concurso.aprovaflow.repository.RegistroEstudoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MateriaService {

    @Autowired
    private MateriaRepository repository;

    @Autowired
    private RegistroEstudoRepository registroRepository;

    public List<Materia> listarTodas() {
        return repository.findAll();
    }

    public Materia salvar(Materia materia) {
        return repository.save(materia);
    }

    public void excluir(Long id) {
        repository.deleteById(id);
    }

    public void resetarHistorico(Long materiaId) {
        List<RegistroEstudo> registros = registroRepository.findAllByMateriaId(materiaId);
        registroRepository.deleteAll(registros);
    }
}