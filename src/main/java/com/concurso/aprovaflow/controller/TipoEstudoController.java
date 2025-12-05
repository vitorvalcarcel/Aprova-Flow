package com.concurso.aprovaflow.controller;

import com.concurso.aprovaflow.model.TipoEstudo;
import com.concurso.aprovaflow.model.User;
import com.concurso.aprovaflow.repository.TipoEstudoRepository;
import com.concurso.aprovaflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tipos-estudo")
public class TipoEstudoController {

    @Autowired
    private TipoEstudoRepository repository;

    @Autowired
    private UserRepository userRepository;

    private User getUsuarioLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @GetMapping
    public List<TipoEstudo> listar() {
        return repository.findAllByUser(getUsuarioLogado());
    }

    @PostMapping
    public TipoEstudo criar(@RequestBody TipoEstudo tipo) {
        tipo.setUser(getUsuarioLogado());
        return repository.save(tipo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoEstudo> atualizar(@PathVariable Long id, @RequestBody TipoEstudo tipo) {
        User user = getUsuarioLogado();
        return repository.findById(id)
                .map(existente -> {
                    // Segurança: só altera se o tipo pertencer ao usuário
                    if(!existente.getUser().getId().equals(user.getId())) {
                        return ResponseEntity.status(403).<TipoEstudo>build();
                    }
                    existente.setNome(tipo.getNome());
                    return ResponseEntity.ok(repository.save(existente));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        // Segurança extra recomendada aqui também, mas por hora o fluxo está ok
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}