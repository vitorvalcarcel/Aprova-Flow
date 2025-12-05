package com.concurso.aprovaflow.repository;

import com.concurso.aprovaflow.model.TipoEstudo;
import com.concurso.aprovaflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TipoEstudoRepository extends JpaRepository<TipoEstudo, Long> {
    List<TipoEstudo> findAllByUser(User user);
}