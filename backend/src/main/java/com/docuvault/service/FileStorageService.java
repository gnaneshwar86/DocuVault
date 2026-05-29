package com.docuvault.service;

import com.docuvault.model.UploadedFile;
import com.docuvault.repository.UploadedFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final NotificationService notificationService;
    private final Path rootLocation = Paths.get("./uploads");
    private final UploadedFileRepository fileRepository;

    @Autowired
    public FileStorageService(UploadedFileRepository fileRepository, NotificationService notificationService) {
        this.fileRepository = fileRepository;
        this.notificationService = notificationService;
    }

    @PostConstruct
    public void init() {
        try {
            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    public static class FilePayload {
        private UUID dbId;
        private String sanitizedFileName;
        private byte[] bytes;
        private String storagePath;

        public FilePayload(UUID dbId, String sanitizedFileName, byte[] bytes, String storagePath) {
            this.dbId = dbId;
            this.sanitizedFileName = sanitizedFileName;
            this.bytes = bytes;
            this.storagePath = storagePath;
        }

        public UUID getDbId() {
            return dbId;
        }

        public String getSanitizedFileName() {
            return sanitizedFileName;
        }

        public byte[] getBytes() {
            return bytes;
        }

        public String getStoragePath() {
            return storagePath;
        }
    }

    /**
     * Sanitizes filename and protects against path traversal.
     */
    public String sanitizeFilename(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            return "document_" + UUID.randomUUID() + ".pdf";
        }

        // Check for path traversal elements
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            throw new IllegalArgumentException("Invalid characters or path traversal elements in filename: " + filename);
        }

        // Get base name
        String baseName = Paths.get(filename).getFileName().toString();

        // Extract extension
        String extension = "";
        int lastDotIndex = baseName.lastIndexOf('.');
        if (lastDotIndex > 0) {
            extension = baseName.substring(lastDotIndex);
            baseName = baseName.substring(0, lastDotIndex);
        }

        // Sanitize base name (allow alphanumeric, underscore, hyphen)
        baseName = baseName.replaceAll("[^a-zA-Z0-9\\-_]", "_");
        if (baseName.trim().isEmpty()) {
            baseName = "document_" + UUID.randomUUID().toString().substring(0, 8);
        }

        // Force .pdf extension
        if (!extension.equalsIgnoreCase(".pdf")) {
            extension = ".pdf";
        }

        return baseName + extension;
    }

    /**
     * Validate that file is indeed PDF
     */
    public void validatePdf(MultipartFile file) {
        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();

        if (contentType == null || !contentType.equalsIgnoreCase("application/pdf")) {
            if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
                throw new IllegalArgumentException("Only PDF files are allowed.");
            }
        }
    }

    /**
     * Process synchronously: saves files to disk immediately and updates DB state as COMPLETED.
     */
    public List<UploadedFile> processSynchronousUpload(List<MultipartFile> files) throws IOException {
        List<UploadedFile> uploadedFiles = new ArrayList<>();

        for (MultipartFile file : files) {
            validatePdf(file);
            String originalFilename = file.getOriginalFilename();
            String sanitized = sanitizeFilename(originalFilename);

            UUID fileUuid = UUID.randomUUID();
            String storageFilename = fileUuid + "_" + sanitized;
            Path targetPath = this.rootLocation.resolve(storageFilename);

            // Save file physically
            Files.copy(file.getInputStream(), targetPath);

            // Save to DB
            UploadedFile entity = new UploadedFile(
                    sanitized,
                    file.getSize(),
                    "application/pdf",
                    targetPath.toString(),
                    LocalDateTime.now(),
                    "COMPLETED"
            );
            entity.setId(fileUuid); // explicitly setting uuid or letting JPA do it is fine. Here we set it.
            uploadedFiles.add(fileRepository.save(entity));
        }

        return uploadedFiles;
    }

    /**
     * Initiates asynchronous database records and gathers payloads for async task.
     */
    public List<FilePayload> prepareAsyncUpload(List<MultipartFile> files) throws IOException {
        List<FilePayload> payloads = new ArrayList<>();

        for (MultipartFile file : files) {
            validatePdf(file);
            String originalFilename = file.getOriginalFilename();
            String sanitized = sanitizeFilename(originalFilename);

            UUID fileUuid = UUID.randomUUID();
            String storageFilename = fileUuid + "_" + sanitized;
            Path targetPath = this.rootLocation.resolve(storageFilename);

            // Create db record with PROCESSING state
            UploadedFile entity = new UploadedFile(
                    sanitized,
                    file.getSize(),
                    "application/pdf",
                    targetPath.toString(),
                    LocalDateTime.now(),
                    "PROCESSING"
            );
            entity.setId(fileUuid);
            UploadedFile saved = fileRepository.save(entity);

            // Read bytes synchronously while request context is still active
            byte[] fileBytes = file.getBytes();

            payloads.add(new FilePayload(saved.getId(), sanitized, fileBytes, targetPath.toString()));
        }

        return payloads;
    }

    /**
     * Executes async writing and updates DB state to COMPLETED or FAILED.
     */
    @Async("taskExecutor")
    public void processAsyncUpload(List<FilePayload> payloads) {
        // Track filenames for notification
        List<String> fileNames = new java.util.ArrayList<>();
        for (FilePayload payload : payloads) {
            try {
                // Write file to disk
                Path targetPath = Paths.get(payload.getStoragePath());
                Files.write(targetPath, payload.getBytes());

                // Update DB state
                fileRepository.findById(payload.getDbId()).ifPresent(entity -> {
                    entity.setStatus("COMPLETED");
                    fileRepository.save(entity);
                });
                // Collect sanitized filename for notification
                fileNames.add(payload.getSanitizedFileName());
            } catch (IOException e) {
                // Mark DB state as FAILED
                fileRepository.findById(payload.getDbId()).ifPresent(entity -> {
                    entity.setStatus("FAILED");
                    fileRepository.save(entity);
                });
            }
        }
        // After processing all files, emit a bulk upload notification
        if (!payloads.isEmpty()) {
            notificationService.createBulkUploadNotification(payloads.size(), fileNames);
        }
    }
}
