package com.concurso.aprovaflow.repository;

import com.concurso.aprovaflow.model.Concurso;
import com.concurso.aprovaflow.model.ConcursoMateria;
import com.concurso.aprovaflow.model.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConcursoMateriaRepository extends JpaRepository<ConcursoMateria, Long> {
    
    List<ConcursoMateria> findByConcurso(Concurso concurso);
    
    Optional<ConcursoMateria> findByConcursoAndMateria(Concurso concurso, Materia materia);
    
    List<ConcursoMateria> findByConcursoId(Long concursoId);

    boolean existsByMateriaId(Long materiaId);
}
