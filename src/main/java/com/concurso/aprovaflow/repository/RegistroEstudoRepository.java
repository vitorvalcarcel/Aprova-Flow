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
    @Query("SELECT r FROM RegistroEstudo r WHERE " +
            "(:materiaId IS NULL OR r.materia.id = :materiaId) AND " +
            "(:topicoId IS NULL OR r.topico.id = :topicoId) AND " +
            "(:tipoEstudo IS NULL OR r.tipoEstudo = :tipoEstudo) AND " +
            "(:data IS NULL OR r.data = :data) " +
            "ORDER BY r.data DESC, r.horaInicio DESC")
    List<RegistroEstudo> findWithFilters(Long materiaId, Long topicoId, String tipoEstudo, java.time.LocalDate data);
}