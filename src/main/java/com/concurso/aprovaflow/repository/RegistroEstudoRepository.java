package com.concurso.aprovaflow.repository;

import com.concurso.aprovaflow.model.RegistroEstudo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RegistroEstudoRepository extends JpaRepository<RegistroEstudo, Long> {
    List<RegistroEstudo> findByCicloId(Long cicloId);

    @Query("SELECT r FROM RegistroEstudo r WHERE r.materia.id = :materiaId")
    List<RegistroEstudo> findAllByMateriaId(Long materiaId);
}