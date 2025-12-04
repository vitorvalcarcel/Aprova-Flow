package com.concurso.aprovaflow.controller;

import com.concurso.aprovaflow.model.Topico;
import com.concurso.aprovaflow.service.TopicoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/topicos")
public class TopicoController {

    @Autowired
    private TopicoService service;

    @GetMapping
    public List<Topico> listar() {
        return service.listarTodos();
    }

    @PostMapping
    public Topico criar(@RequestBody Topico topico) {
        return service.salvar(topico);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Topico> atualizar(@PathVariable Long id, @RequestBody Topico topico) {
        topico.setId(id);
        return ResponseEntity.ok(service.salvar(topico));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
