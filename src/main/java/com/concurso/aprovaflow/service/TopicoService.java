package com.concurso.aprovaflow.service;

import com.concurso.aprovaflow.model.Materia;
import com.concurso.aprovaflow.model.Topico;
import com.concurso.aprovaflow.model.User;
import com.concurso.aprovaflow.repository.MateriaRepository;
import com.concurso.aprovaflow.repository.TopicoRepository;
import com.concurso.aprovaflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TopicoService {

    @Autowired
    private TopicoRepository repository;

    @Autowired
    private MateriaRepository materiaRepository;

    @Autowired
    private UserRepository userRepository;

    private User getUsuarioLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    public List<Topico> listarTodos() {
        // Correção: Retorna apenas tópicos das matérias do usuário
        return repository.findAllByMateriaUser(getUsuarioLogado());
    }

    public Topico salvar(Topico topico) {
        // Validação de Segurança: A matéria pertence ao usuário?
        if (topico.getMateria() != null && topico.getMateria().getId() != null) {
             Materia m = materiaRepository.findById(topico.getMateria().getId())
                 .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));
             
             if (!m.getUser().getId().equals(getUsuarioLogado().getId())) {
                 throw new RuntimeException("Acesso Negado: Essa matéria não é sua.");
             }
             topico.setMateria(m);
        }
        return repository.save(topico);
    }

    public void excluir(Long id) {
        // Validação extra antes de excluir
        Topico t = repository.findById(id).orElse(null);
        if (t != null && t.getMateria().getUser().getId().equals(getUsuarioLogado().getId())) {
             repository.deleteById(id);
        }
    }
}