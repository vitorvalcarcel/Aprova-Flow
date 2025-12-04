package com.concurso.aprovaflow.config;

import com.concurso.aprovaflow.model.TipoEstudo;
import com.concurso.aprovaflow.repository.TipoEstudoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner loadData(TipoEstudoRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                List<String> padroes = Arrays.asList("Videoaula", "PDF", "Questões", "Revisão");
                for (String nome : padroes) {
                    TipoEstudo tipo = new TipoEstudo();
                    tipo.setNome(nome);
                    repository.save(tipo);
                }
                System.out.println("Tipos de Estudo padrão carregados!");
            }
        };
    }
}
