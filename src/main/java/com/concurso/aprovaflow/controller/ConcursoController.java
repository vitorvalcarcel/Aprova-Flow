package com.concurso.aprovaflow.controller;

import com.concurso.aprovaflow.model.Concurso;
import com.concurso.aprovaflow.service.ConcursoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/concursos")
@CrossOrigin(origins = "*")
public class ConcursoController {

    @Autowired
    private ConcursoService service;

    @Autowired
    private com.concurso.aprovaflow.service.ConcursoMateriaService concursoMateriaService;

    @Autowired
    private com.concurso.aprovaflow.service.MateriaService materiaService;
    
    @Autowired
    private com.concurso.aprovaflow.service.CicloService cicloService;

    @GetMapping("/ativo")
    public ResponseEntity<?> getAtivo() {
        Optional<Concurso> ativo = service.buscarConcursoAtivo();
        if (ativo.isPresent()) {
            return ResponseEntity.ok(ativo.get());
        } else {
            return ResponseEntity.noContent().build();
        }
    }

    @PostMapping
    public ResponseEntity<Concurso> criar(@RequestBody com.concurso.aprovaflow.dto.ConcursoDTO dto) {
        Concurso novo = service.criarConcurso(dto);
        return ResponseEntity.ok(novo);
    }
    
    @PostMapping("/{id}/materias")
    public ResponseEntity<?> vincularMateria(@PathVariable Long id, @RequestBody com.concurso.aprovaflow.dto.VinculoMateriaDTO dto) {
        Optional<Concurso> concursoOpt = service.buscarPorId(id);
        if (concursoOpt.isEmpty()) return ResponseEntity.notFound().build();
        
        // Busca materia. Precisamos de um findById no MateriaService ou usar repository direto?
        // Vamos assumir que MateriaService tem ou repository direto.
        // O MateriaService atual NÃO TEM buscarPorId público simples que retorne Optional.
        // Vou improvisar buscando do repository se precisar ou criar metodo no service depois.
        // Para simplificar, vou usar materiaService.listarTodas() e filtrar (não performatico mas funciona agora) ou melhor: injetar MateriaRepository aqui? Não, anti-pattern.
        // Melhor adicionar buscarPorId no MateriaService rapidinho depois. 
        // Por hora, vou assumir que vou adicionar esse metodo no service.
        com.concurso.aprovaflow.model.Materia materia = materiaService.buscarPorId(dto.getMateriaId());
        
        var vinculado = concursoMateriaService.vincular(concursoOpt.get(), materia, dto.getPeso(), dto.getOrdem());
        return ResponseEntity.ok(vinculado);
    }
    
    @GetMapping("/{id}/ciclo-atual")
    public ResponseEntity<?> getCicloAtual(@PathVariable Long id) {
        Optional<Concurso> concursoOpt = service.buscarPorId(id);
        if (concursoOpt.isEmpty()) return ResponseEntity.notFound().build();
        
        return ResponseEntity.ok(cicloService.getDadosCicloAtual(concursoOpt.get()));
    }
    
    @PostMapping("/{id}/fechar-ciclo")
    public ResponseEntity<?> fecharCiclo(@PathVariable Long id) {
        Optional<Concurso> concursoOpt = service.buscarPorId(id);
        if (concursoOpt.isEmpty()) return ResponseEntity.notFound().build();
        
        try {
            cicloService.fecharCiclo(concursoOpt.get());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<Iterable<Concurso>> listar() {
        return ResponseEntity.ok(service.listarConcursos());
    }

    @PutMapping("/{id}/ativo")
    public ResponseEntity<?> ativar(@PathVariable Long id) {
        try {
            service.ativarConcurso(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
         try {
            service.excluirConcurso(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @RequestBody com.concurso.aprovaflow.dto.ConcursoDTO dto) {
        try {
            Concurso atualizado = service.atualizarConcurso(id, dto);
            return ResponseEntity.ok(atualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
