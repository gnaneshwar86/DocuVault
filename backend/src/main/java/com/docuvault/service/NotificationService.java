package com.docuvault.service;

import com.docuvault.model.Notification;
import com.docuvault.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    // Thread‑safe list of emitters for all connected clients
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /** Register a new SSE emitter for a client */
    public SseEmitter registerEmitter() {
        // timeout set to 30 minutes; client should reconnect on timeout
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((e) -> emitters.remove(emitter));
        return emitter;
    }

    /** Create and persist a notification, then push to all connected clients */
    public Notification createBulkUploadNotification(int fileCount, List<String> fileNames) {
        String message = fileCount + " files uploaded successfully";
        String related = String.join(",", fileNames);
        Notification notification = new Notification(message, "BULK_UPLOAD_COMPLETE", LocalDateTime.now(), related);
        Notification saved = notificationRepository.save(notification);
        pushNotification(saved);
        return saved;
    }

    /** Push a notification to all SSE clients */
    private void pushNotification(Notification notification) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(notification);
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }

    /** Mark a notification as read */
    public Notification markAsRead(Long id) {
        return notificationRepository.findById(id).map(n -> {
            n.setRead(true);
            return notificationRepository.save(n);
        }).orElse(null);
    }

    /** Delete a notification */
    public void delete(Long id) {
        notificationRepository.deleteById(id);
    }

    /** Retrieve all notifications ordered by newest */
    public List<Notification> getAll() {
        return notificationRepository.findAllByOrderByTimestampDesc();
    }
}
