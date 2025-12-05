package com.concurso.aprovaflow.repository;

import com.concurso.aprovaflow.model.Materia;
import com.concurso.aprovaflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MateriaRepository extends JpaRepository<Materia, Long> {
    List<Materia> findAllByUser(User user);
}