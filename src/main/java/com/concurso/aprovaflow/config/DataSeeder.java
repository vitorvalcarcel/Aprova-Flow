package com.concurso.aprovaflow.config;

import com.concurso.aprovaflow.model.*;
import com.concurso.aprovaflow.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(ConcursoRepository concursoRepo, 
                                   MateriaRepository materiaRepo,
                                   TopicoRepository topicoRepo,
                                   CicloRepository cicloRepo) {
        return args -> {
            if (concursoRepo.count() == 0) {
                System.out.println("🌱 Semeando banco de dados com Edital do BB...");

                Concurso bb = new Concurso();
                bb.setNome("Banco do Brasil - Agente de Tecnologia");
                bb.setDataProva(LocalDate.of(2026, 4, 23));
                concursoRepo.save(bb);

                Ciclo ciclo1 = new Ciclo();
                ciclo1.setNumero(1);
                ciclo1.setHorasTotais(12.0);
                ciclo1.setAtivo(true);
                cicloRepo.save(ciclo1);

                // Criando matérias com pesos do edital
                criarMateria(materiaRepo, bb, "Língua Portuguesa", 1.5, 10);
                criarMateria(materiaRepo, bb, "Língua Inglesa", 1.0, 5);
                criarMateria(materiaRepo, bb, "Matemática", 1.5, 5);
                criarMateria(materiaRepo, bb, "Atualidades do Mercado", 1.0, 5);
                criarMateria(materiaRepo, bb, "Probabilidade e Estatística", 1.5, 5);
                criarMateria(materiaRepo, bb, "Conhecimentos Bancários", 1.5, 5);
                
                Materia ti = new Materia();
                ti.setNome("Tecnologia da Informação");
                ti.setPeso(1.5);
                ti.setQtdQuestoesProva(35);
                ti.setConcurso(bb);
                materiaRepo.save(ti);

                // Alguns tópicos de exemplo para TI
                criarTopico(topicoRepo, ti, 1, "Aprendizagem de máquina");
                criarTopico(topicoRepo, ti, 2, "Banco de Dados (NoSQL, SQL, SGBD)");
                criarTopico(topicoRepo, ti, 6, "Java (SE 11 e EE 8), Python, Ansible");

                System.out.println("✅ Banco de dados populado com sucesso!");
            }
        };
    }

    private void criarMateria(MateriaRepository repo, Concurso c, String nome, Double peso, Integer qtd) {
        Materia m = new Materia();
        m.setNome(nome);
        m.setPeso(peso);
        m.setQtdQuestoesProva(qtd);
        m.setConcurso(c);
        repo.save(m);
    }

    private void criarTopico(TopicoRepository repo, Materia m, Integer numero, String descricao) {
        Topico t = new Topico();
        t.setNumeroEdital(numero);
        t.setDescricao(descricao);
        t.setMateria(m);
        repo.save(t);
    }
}