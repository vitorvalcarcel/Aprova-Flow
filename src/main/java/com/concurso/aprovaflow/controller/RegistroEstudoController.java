package com.concurso.aprovaflow.controller;

import com.concurso.aprovaflow.dto.DashboardDTO;
import com.concurso.aprovaflow.dto.RegistroDTO;
import com.concurso.aprovaflow.model.RegistroEstudo;
import com.concurso.aprovaflow.repository.TopicoRepository;
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
    private MateriaService materiaService;

    @Autowired
    private TopicoRepository topicoRepository;

    @PostMapping
    public ResponseEntity<RegistroEstudo> salvar(@RequestBody RegistroDTO dto) {
        RegistroEstudo novo = new RegistroEstudo();
        novo.setData(dto.getData());
        novo.setHoraInicio(dto.getHoraInicio()); // Mapeando hora inicio
        novo.setTipoEstudo(dto.getTipoEstudo());
        novo.setAnotacoes(dto.getAnotacoes());   // Mapeando anotações
        novo.setQuestoesFeitas(dto.getQuestoesFeitas());
        novo.setQuestoesCertas(dto.getQuestoesCertas());
        
        // Calcula erradas automaticamente se houver dados
        if (dto.getQuestoesFeitas() != null && dto.getQuestoesCertas() != null) {
            novo.setQuestoesErradas(dto.getQuestoesFeitas() - dto.getQuestoesCertas());
        } else {
            novo.setQuestoesFeitas(0);
            novo.setQuestoesCertas(0);
            novo.setQuestoesErradas(0);
        }
        
        // Converte "01:30" para objeto de Hora do Java
        // Garante formato HH:mm:ss
        String horaFormatada = dto.getCargaHoraria().length() == 5 ? dto.getCargaHoraria() + ":00" : dto.getCargaHoraria();
        novo.setCargaHoraria(LocalTime.parse(horaFormatada)); 

        // 1. Busca e define a Matéria (Obrigatória)
        var materia = materiaService.listarTodas().stream()
                .filter(m -> m.getId().equals(dto.getMateriaId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));
        novo.setMateria(materia);

        // 2. Busca e define o Tópico (Opcional)
        if (dto.getTopicoId() != null) {
            var topico = topicoRepository.findById(dto.getTopicoId())
                    .orElse(null); 
            novo.setTopico(topico);
        }

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
        dash.setMensagemMotivacional("Foco no Banco do Brasil! Continue firme.");
        dash.setDesempenhoPorMateria(List.of()); 
        return ResponseEntity.ok(dash);
    }

    @GetMapping
    public List<RegistroEstudo> listar(
            @RequestParam(required = false) Long materiaId,
            @RequestParam(required = false) Long topicoId,
            @RequestParam(required = false) String tipoEstudo,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate dataInicio,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate dataFim
    ) {
        return registroService.listarComFiltros(materiaId, topicoId, tipoEstudo, dataInicio, dataFim);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RegistroEstudo> atualizar(@PathVariable Long id, @RequestBody RegistroDTO dto) {
        RegistroEstudo existente = registroService.buscarPorId(id);
        
        existente.setData(dto.getData());
        existente.setHoraInicio(dto.getHoraInicio());
        existente.setTipoEstudo(dto.getTipoEstudo());
        existente.setAnotacoes(dto.getAnotacoes());
        existente.setQuestoesFeitas(dto.getQuestoesFeitas());
        existente.setQuestoesCertas(dto.getQuestoesCertas());
        
        if (dto.getQuestoesFeitas() != null && dto.getQuestoesCertas() != null) {
            existente.setQuestoesErradas(dto.getQuestoesFeitas() - dto.getQuestoesCertas());
        }

        String horaFormatada = dto.getCargaHoraria().length() == 5 ? dto.getCargaHoraria() + ":00" : dto.getCargaHoraria();
        existente.setCargaHoraria(LocalTime.parse(horaFormatada));

        var materia = materiaService.listarTodas().stream()
                .filter(m -> m.getId().equals(dto.getMateriaId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));
        existente.setMateria(materia);

        if (dto.getTopicoId() != null) {
            var topico = topicoRepository.findById(dto.getTopicoId()).orElse(null);
            existente.setTopico(topico);
        } else {
            existente.setTopico(null);
        }

        return ResponseEntity.ok(registroService.atualizar(existente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        registroService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}