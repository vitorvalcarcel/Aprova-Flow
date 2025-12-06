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
    public ResponseEntity<Concurso> criar(@RequestBody Map<String, String> payload) {
        String nome = payload.get("nome");
        if (nome == null || nome.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Concurso novo = service.criarConcurso(nome);
        return ResponseEntity.ok(novo);
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
}
