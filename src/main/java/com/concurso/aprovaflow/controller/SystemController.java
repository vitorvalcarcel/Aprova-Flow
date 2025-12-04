package com.concurso.aprovaflow.controller;

import com.concurso.aprovaflow.service.HeartbeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/system")
@CrossOrigin(origins = "*")
public class SystemController {

    @Autowired
    private HeartbeatService heartbeatService;

    @PostMapping("/heartbeat")
    public void heartbeat() {
        heartbeatService.beat();
    }
}
