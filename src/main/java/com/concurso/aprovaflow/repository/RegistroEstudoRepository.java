package com.concurso.aprovaflow.repository;

import com.concurso.aprovaflow.model.RegistroEstudo;
import com.concurso.aprovaflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RegistroEstudoRepository extends JpaRepository<RegistroEstudo, Long> {
    
    List<RegistroEstudo> findByConcursoId(Long concursoId);
    
    List<RegistroEstudo> findByConcursoIdAndUser(Long concursoId, User user);

    List<RegistroEstudo> findAllByMateriaIdAndUser(Long materiaId, User user);

    @Query("SELECT r FROM RegistroEstudo r WHERE " +
            "r.user.id = :userId AND " +
            "((:materiaIds) IS NULL OR (:topicoIds) IS NULL OR (r.materia.id IN :materiaIds OR r.topico.id IN :topicoIds)) AND " +
            "(:tipoEstudoId IS NULL OR r.tipoEstudo.id = :tipoEstudoId) AND " +
            "((:dataInicio IS NULL OR r.data >= :dataInicio) AND (:dataFim IS NULL OR r.data <= :dataFim)) " +
            "ORDER BY r.data DESC, r.horaInicio DESC")
    List<RegistroEstudo> findWithFilters(Long userId, List<Long> materiaIds, List<Long> topicoIds, Long tipoEstudoId, java.time.LocalDate dataInicio, java.time.LocalDate dataFim);
}