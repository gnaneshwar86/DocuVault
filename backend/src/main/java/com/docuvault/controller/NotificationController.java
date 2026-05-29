package com.docuvault.controller;

import com.docuvault.dto.NotificationDTO;
import com.docuvault.model.Notification;
import com.docuvault.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Get all notifications for the current user (no auth implemented yet)
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getAll() {
        List<Notification> notifications = notificationService.getAll();
        List<NotificationDTO> dtos = notifications.stream()
                .map(n -> new NotificationDTO(
                        n.getId(),
                        n.getMessage(),
                        n.getType(),
                        n.getTimestamp(),
                        n.isRead(),
                        n.getRelatedFiles()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Mark a notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        Notification updated = notificationService.markAsRead(id);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        NotificationDTO dto = new NotificationDTO(
                updated.getId(),
                updated.getMessage(),
                updated.getType(),
                updated.getTimestamp(),
                updated.isRead(),
                updated.getRelatedFiles());
        return ResponseEntity.ok(dto);
    }

    // Delete a notification
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        notificationService.delete(id);
        return ResponseEntity.noContent().build();

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", null,
                "message", "All notifications marked as read"
        ));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> unreadCount() {
        long count = notificationService.unreadCount();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of("unreadCount", count),
                "message", "Unread notification count"
        ));
    }
    }
}
