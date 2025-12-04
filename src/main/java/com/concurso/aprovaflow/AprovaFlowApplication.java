package com.concurso.aprovaflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.core.env.Environment;
import org.springframework.beans.factory.annotation.Autowired;

import java.awt.Desktop;
import java.io.File;
import java.net.URI;

@SpringBootApplication
@EnableScheduling
public class AprovaFlowApplication {

    @Autowired
    private Environment env;

    public static void main(String[] args) {
        // Verificar/Criar pasta data
        File dataDir = new File("./data");
        if (!dataDir.exists()) {
            boolean created = dataDir.mkdirs();
            if (created) {
                System.out.println("Pasta ./data criada com sucesso.");
            }
        }

        SpringApplication.run(AprovaFlowApplication.class, args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void openBrowser() {
        String port = env.getProperty("local.server.port");
        String url = "http://localhost:" + port;
        System.out.println("Aplicação iniciada! Abrindo navegador em: " + url);

        try {
            if (Desktop.isDesktopSupported()) {
                Desktop.getDesktop().browse(new URI(url));
            } else {
                // Fallback para Windows se Desktop não for suportado (ex: alguns ambientes headless, mas aqui é desktop app)
                Runtime.getRuntime().exec("rundll32 url.dll,FileProtocolHandler " + url);
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Não foi possível abrir o navegador automaticamente.");
        }
    }
}
