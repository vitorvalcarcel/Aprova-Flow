package com.concurso.aprovaflow.controller;

import com.concurso.aprovaflow.model.Materia;
import com.concurso.aprovaflow.service.MateriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/materias")
public class MateriaController {

    @Autowired
    private MateriaService service;

    @GetMapping
    public List<Materia> listar() {
        return service.listarTodas();
    }
}