package com.concurso.aprovaflow.repository;

import com.concurso.aprovaflow.model.Concurso;
import com.concurso.aprovaflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConcursoRepository extends JpaRepository<Concurso, Long> {
    Optional<Concurso> findByAtivoTrueAndUser(User user);
    List<Concurso> findAllByUser(User user);
}