package com.concurso.aprovaflow.controller;

import com.concurso.aprovaflow.model.TipoEstudo;
import com.concurso.aprovaflow.repository.TipoEstudoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tipos-estudo")
public class TipoEstudoController {

    @Autowired
    private TipoEstudoRepository repository;

    @GetMapping
    public List<TipoEstudo> listar() {
        return repository.findAll();
    }

    @PostMapping
    public TipoEstudo criar(@RequestBody TipoEstudo tipo) {
        return repository.save(tipo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoEstudo> atualizar(@PathVariable Long id, @RequestBody TipoEstudo tipo) {
        return repository.findById(id)
                .map(existente -> {
                    existente.setNome(tipo.getNome());
                    return ResponseEntity.ok(repository.save(existente));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
