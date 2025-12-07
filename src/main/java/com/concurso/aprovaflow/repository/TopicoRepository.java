package com.concurso.aprovaflow.repository;

import com.concurso.aprovaflow.model.Topico;
import com.concurso.aprovaflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TopicoRepository extends JpaRepository<Topico, Long> {
    List<Topico> findByMateriaIdOrderByNumeroEditalAsc(Long materiaId);
    List<Topico> findAllByMateriaUser(User user);
    java.util.Optional<Topico> findByDescricaoAndMateriaId(String descricao, Long materiaId);
}