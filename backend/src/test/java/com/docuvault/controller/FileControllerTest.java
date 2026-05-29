package com.docuvault.controller;

import com.docuvault.model.UploadedFile;
import com.docuvault.repository.UploadedFileRepository;
import com.docuvault.service.FileStorageService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FileController.class)
public class FileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FileStorageService fileStorageService;

    @MockBean
    private UploadedFileRepository fileRepository;

    @Test
    public void testGetAllFiles() throws Exception {
        UploadedFile file = new UploadedFile("test.pdf", 1024L, "application/pdf", "./uploads/test.pdf", LocalDateTime.now(), "COMPLETED");
        file.setId(UUID.randomUUID());

        Mockito.when(fileRepository.findAllByOrderByUploadDateDesc()).thenReturn(List.of(file));

        mockMvc.perform(get("/api/files"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].fileName").value("test.pdf"))
                .andExpect(jsonPath("$.message").value("Fetched list of files successfully."));
    }

    @Test
    public void testUploadFilesSync() throws Exception {
        MockMultipartFile file = new MockMultipartFile("files", "test.pdf", "application/pdf", "dummy pdf content".getBytes());
        UploadedFile savedFile = new UploadedFile("test.pdf", 18L, "application/pdf", "./uploads/test.pdf", LocalDateTime.now(), "COMPLETED");
        savedFile.setId(UUID.randomUUID());

        Mockito.when(fileStorageService.processSynchronousUpload(any())).thenReturn(List.of(savedFile));

        mockMvc.perform(multipart("/api/files/upload").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].fileName").value("test.pdf"))
                .andExpect(jsonPath("$.message").value("Files uploaded successfully."));
    }
}
