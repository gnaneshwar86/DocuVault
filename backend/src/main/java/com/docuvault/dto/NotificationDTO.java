package com.docuvault.dto;

import java.time.LocalDateTime;

public class NotificationDTO {
    private Long id;
    private String message;
    private String type;
    private LocalDateTime timestamp;
    private boolean isRead;
    private String relatedFiles;

    public NotificationDTO() {}

    public NotificationDTO(Long id, String message, String type, LocalDateTime timestamp, boolean isRead, String relatedFiles) {
        this.id = id;
        this.message = message;
        this.type = type;
        this.timestamp = timestamp;
        this.isRead = isRead;
        this.relatedFiles = relatedFiles;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { this.isRead = read; }
    public String getRelatedFiles() { return relatedFiles; }
    public void setRelatedFiles(String relatedFiles) { this.relatedFiles = relatedFiles; }
}
