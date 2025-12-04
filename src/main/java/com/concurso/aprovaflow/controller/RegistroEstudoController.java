package com.concurso.aprovaflow.controller;

import com.concurso.aprovaflow.dto.DashboardDTO;
import com.concurso.aprovaflow.dto.RegistroDTO;
import com.concurso.aprovaflow.model.RegistroEstudo;
import com.concurso.aprovaflow.service.MateriaService;
import com.concurso.aprovaflow.service.RegistroEstudoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/estudos")
public class RegistroEstudoController {

    @Autowired
    private RegistroEstudoService registroService;

    @Autowired
    private MateriaService materiaService; // Para buscar a matéria pelo ID

    @PostMapping
    public ResponseEntity<RegistroEstudo> salvar(@RequestBody RegistroDTO dto) {
        RegistroEstudo novo = new RegistroEstudo();
        novo.setData(dto.getData());
        novo.setTipoEstudo(dto.getTipoEstudo());
        novo.setQuestoesFeitas(dto.getQuestoesFeitas());
        novo.setQuestoesCertas(dto.getQuestoesCertas());
        novo.setQuestoesErradas(dto.getQuestoesFeitas() - dto.getQuestoesCertas());
        
        // Convertendo String "01:30" para LocalTime
        novo.setCargaHoraria(LocalTime.parse(dto.getCargaHoraria() + ":00")); 

        // Buscando a matéria no banco pelo ID que veio do DTO
        var materia = materiaService.listarTodas().stream()
                .filter(m -> m.getId().equals(dto.getMateriaId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));
        
        novo.setMateria(materia);

        return ResponseEntity.ok(registroService.registrar(novo));
    }

    @GetMapping("/ciclo-atual")
    public List<RegistroEstudo> listarDoCiclo() {
        return registroService.listarDoCicloAtual();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard() {
        DashboardDTO dash = new DashboardDTO();
        dash.setTotalHorasCiclo(registroService.calcularTotalHorasCiclo());
        dash.setMensagemMotivacional("Faltam poucos dias para a prova! Continue firme.");
        
        // Aqui futuramente calculamos o desempenho por matéria
        // Por enquanto vamos retornar a lista vazia só para testar
        dash.setDesempenhoPorMateria(List.of());

        return ResponseEntity.ok(dash);
    }
}