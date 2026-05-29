package com.docuvault.controller;

import com.docuvault.dto.ApiResponse;
import com.docuvault.dto.AsyncUploadResponse;
import com.docuvault.model.UploadedFile;
import com.docuvault.repository.UploadedFileRepository;
import com.docuvault.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService fileStorageService;
    private final UploadedFileRepository fileRepository;

    @Autowired
    public FileController(FileStorageService fileStorageService, UploadedFileRepository fileRepository) {
        this.fileStorageService = fileStorageService;
        this.fileRepository = fileRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Object>> uploadFiles(@RequestParam("files") List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No files selected for upload.", 400));
        }

        try {
            if (files.size() <= 3) {
                // Synchronous upload
                List<UploadedFile> uploaded = fileStorageService.processSynchronousUpload(files);
                return ResponseEntity.ok(ApiResponse.success(uploaded, "Files uploaded successfully."));
            } else {
                // Asynchronous upload
                String batchId = UUID.randomUUID().toString();
                List<FileStorageService.FilePayload> payloads = fileStorageService.prepareAsyncUpload(files);
                fileStorageService.processAsyncUpload(payloads);

                AsyncUploadResponse asyncResponse = new AsyncUploadResponse(batchId, files.size(), "PROCESSING");
                return ResponseEntity.ok(ApiResponse.success(asyncResponse, "Files are being processed in the background."));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), 400));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("File upload failed: " + e.getMessage(), 500));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UploadedFile>>> getAllFiles() {
        try {
            List<UploadedFile> files = fileRepository.findAllByOrderByUploadDateDesc();
            return ResponseEntity.ok(ApiResponse.success(files, "Fetched list of files successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch files: " + e.getMessage(), 500));
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Object> downloadFile(@PathVariable("id") UUID id) {
        UploadedFile fileEntity = fileRepository.findById(id).orElse(null);
        if (fileEntity == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("File metadata not found in database.", 404));
        }

        if (!"COMPLETED".equalsIgnoreCase(fileEntity.getStatus())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File upload has not completed yet or failed.", 400));
        }

        try {
            Path filePath = Paths.get(fileEntity.getStoragePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentDisposition = "attachment; filename=\"" + fileEntity.getFileName() + "\"";
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_PDF)
                        .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                        .body(resource);
            } else {
                return ResponseEntity.status(404).body(ApiResponse.error("Physical file not found on disk.", 404));
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Error reading the file: " + e.getMessage(), 500));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteFile(@PathVariable("id") UUID id) {
        UploadedFile fileEntity = fileRepository.findById(id).orElse(null);
        if (fileEntity == null) {
            return ResponseEntity.status(404).body(ApiResponse.error("File metadata not found.", 404));
        }

        try {
            // Delete physical file
            if (fileEntity.getStoragePath() != null) {
                Path filePath = Paths.get(fileEntity.getStoragePath());
                Files.deleteIfExists(filePath);
            }

            // Delete db record
            fileRepository.delete(fileEntity);

            return ResponseEntity.ok(ApiResponse.success(null, "File deleted successfully."));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to delete physical file: " + e.getMessage(), 500));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to delete file database record: " + e.getMessage(), 500));
        }
    }
}
