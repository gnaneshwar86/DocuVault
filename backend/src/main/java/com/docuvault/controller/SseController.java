package com.docuvault.controller;

import com.docuvault.dto.NotificationDTO;
import com.docuvault.model.Notification;
import com.docuvault.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sse")
public class SseController {

    private final NotificationService notificationService;

    @Autowired
    public SseController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        return notificationService.registerEmitter();
    }
}
