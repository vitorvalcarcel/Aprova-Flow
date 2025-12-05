package com.concurso.aprovaflow.repository;

import com.concurso.aprovaflow.model.RegistroEstudo;
import com.concurso.aprovaflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RegistroEstudoRepository extends JpaRepository<RegistroEstudo, Long> {
    
    List<RegistroEstudo> findByCicloIdAndUser(Long cicloId, User user);

    List<RegistroEstudo> findAllByMateriaIdAndUser(Long materiaId, User user);

    @Query("SELECT r FROM RegistroEstudo r WHERE " +
            "r.user.id = :userId AND " +
            "(:materiaId IS NULL OR r.materia.id = :materiaId) AND " +
            "(:topicoId IS NULL OR r.topico.id = :topicoId) AND " +
            "(:tipoEstudoId IS NULL OR r.tipoEstudo.id = :tipoEstudoId) AND " +
            "((:dataInicio IS NULL OR r.data >= :dataInicio) AND (:dataFim IS NULL OR r.data <= :dataFim)) " +
            "ORDER BY r.data DESC, r.horaInicio DESC")
    List<RegistroEstudo> findWithFilters(Long userId, Long materiaId, Long topicoId, Long tipoEstudoId, java.time.LocalDate dataInicio, java.time.LocalDate dataFim);
}