package com.concurso.aprovaflow.service;

import com.concurso.aprovaflow.model.Concurso;
import com.concurso.aprovaflow.model.ConcursoMateria;
import com.concurso.aprovaflow.model.Materia;
import com.concurso.aprovaflow.repository.ConcursoMateriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ConcursoMateriaService {

    @Autowired
    private ConcursoMateriaRepository repository;

    public ConcursoMateria vincular(Concurso concurso, Materia materia, Double peso, Integer ordem) {
        Optional<ConcursoMateria> existente = repository.findByConcursoAndMateria(concurso, materia);
        
        ConcursoMateria cm;
        if (existente.isPresent()) {
            cm = existente.get();
        } else {
            cm = new ConcursoMateria();
            cm.setConcurso(concurso);
            cm.setMateria(materia);
        }
        
        cm.setPeso(peso);
        cm.setOrdem(ordem);
        return repository.save(cm);
    }

    public List<ConcursoMateria> listarPorConcurso(Concurso concurso) {
        return repository.findByConcurso(concurso);
    }
    
    public void desvincular(Long id) {
        repository.deleteById(id);
    }
}
