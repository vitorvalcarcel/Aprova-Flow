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

    public ConcursoMateria vincular(Concurso concurso, Materia materia, Double peso, Integer ordem, Integer questoesProva, Double horasCiclo) {
        Optional<ConcursoMateria> existente = repository.findByConcursoAndMateria(concurso, materia);
        
        ConcursoMateria cm;
        if (existente.isPresent()) {
            cm = existente.get();
        } else {
            cm = new ConcursoMateria();
            cm.setConcurso(concurso);
            cm.setMateria(materia);
        }

        // Validação de Horas
        if (horasCiclo != null && horasCiclo > 0) {
            double limite = concurso.getCargaHorariaCiclo() != null ? concurso.getCargaHorariaCiclo() : 24.0;
            List<ConcursoMateria> todas = repository.findByConcurso(concurso);
            double somaOutras = todas.stream()
                .filter(c -> cm.getId() == null || !c.getId().equals(cm.getId()))
                .mapToDouble(c -> c.getHorasCiclo() != null ? c.getHorasCiclo() : 0.0)
                .sum();
            
            if (somaOutras + horasCiclo > limite) {
                throw new RuntimeException("A soma das horas (" + (somaOutras + horasCiclo) + "h) excede o limite do ciclo (" + limite + "h).");
            }
        }
        
        cm.setPeso(peso);
        cm.setOrdem(ordem);
        cm.setQuestoesProva(questoesProva);
        cm.setHorasCiclo(horasCiclo);
        return repository.save(cm);
    }

    public List<ConcursoMateria> listarPorConcurso(Concurso concurso) {
        return repository.findByConcurso(concurso);
    }
    
    public void desvincular(Long id) {
        repository.deleteById(id);
    }
}
