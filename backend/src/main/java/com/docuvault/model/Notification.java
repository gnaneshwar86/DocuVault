package com.docuvault.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private String type; // e.g., BULK_UPLOAD_COMPLETE

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    // For simplicity store related file IDs as a comma‑separated string
    @Column(name = "related_files")
    private String relatedFiles;

    public Notification() {}

    public Notification(String message, String type, LocalDateTime timestamp, String relatedFiles) {
        this.message = message;
        this.type = type;
        this.timestamp = timestamp;
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
    public void setRead(boolean read) { isRead = read; }
    public String getRelatedFiles() { return relatedFiles; }
    public void setRelatedFiles(String relatedFiles) { this.relatedFiles = relatedFiles; }
}
