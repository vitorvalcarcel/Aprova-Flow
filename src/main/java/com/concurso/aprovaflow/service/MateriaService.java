package com.concurso.aprovaflow.service;

import com.concurso.aprovaflow.model.Materia;
import com.concurso.aprovaflow.model.RegistroEstudo;
import com.concurso.aprovaflow.model.User;
import com.concurso.aprovaflow.repository.MateriaRepository;
import com.concurso.aprovaflow.repository.RegistroEstudoRepository;
import com.concurso.aprovaflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MateriaService {

    @Autowired
    private MateriaRepository repository;

    @Autowired
    private RegistroEstudoRepository registroRepository;

    @Autowired
    private UserRepository userRepository;

    private User getUsuarioLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Usuário off"));
    }

    public List<Materia> listarTodas() {
        return repository.findAllByUser(getUsuarioLogado());
    }

    public Materia salvar(Materia materia) {
        User user = getUsuarioLogado();
        materia.setUser(user);
        return repository.save(materia);
    }

    public void excluir(Long id) {
        User user = getUsuarioLogado();
        repository.deleteById(id);
    }

    public void resetarHistorico(Long materiaId) {
        User user = getUsuarioLogado();
        List<RegistroEstudo> registros = registroRepository.findAllByMateriaIdAndUser(materiaId, user);
        registroRepository.deleteAll(registros);
    }
}