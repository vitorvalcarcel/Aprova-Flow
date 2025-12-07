package com.concurso.aprovaflow.repository;

import com.concurso.aprovaflow.model.Ciclo;
import com.concurso.aprovaflow.model.Concurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CicloRepository extends JpaRepository<Ciclo, Long> {
    Optional<Ciclo> findByAtivoTrue();
    Optional<Ciclo> findByConcursoAndAtivoTrue(Concurso concurso);
    List<Ciclo> findAllByConcurso(Concurso concurso);
}