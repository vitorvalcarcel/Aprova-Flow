package com.concurso.aprovaflow.repository;

import com.concurso.aprovaflow.model.CicloHistorico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CicloHistoricoRepository extends JpaRepository<CicloHistorico, Long> {
    
    List<CicloHistorico> findByCicloId(Long cicloId);
}
