package com.docuvault.service;

import com.docuvault.repository.UploadedFileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;

public class FileStorageServiceTest {

    @Mock
    private UploadedFileRepository fileRepository;

    private FileStorageService fileStorageService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        fileStorageService = new FileStorageService(fileRepository);
    }

    @Test
    public void testSanitizeFilenameNormal() {
        String result = fileStorageService.sanitizeFilename("invoice.pdf");
        assertEquals("invoice.pdf", result);
    }

    @Test
    public void testSanitizeFilenameSpecialCharacters() {
        String result = fileStorageService.sanitizeFilename("inv oice!@#123.pdf");
        assertEquals("inv_oice___123.pdf", result);
    }

    @Test
    public void testSanitizeFilenameForcePdfExtension() {
        String result = fileStorageService.sanitizeFilename("document.txt");
        assertEquals("document.pdf", result);

        String result2 = fileStorageService.sanitizeFilename("report");
        assertEquals("report.pdf", result2);
    }

    @Test
    public void testSanitizeFilenamePathTraversalBlocked() {
        assertThrows(IllegalArgumentException.class, () -> {
            fileStorageService.sanitizeFilename("../etc/passwd");
        });

        assertThrows(IllegalArgumentException.class, () -> {
            fileStorageService.sanitizeFilename("folder/file.pdf");
        });

        assertThrows(IllegalArgumentException.class, () -> {
            fileStorageService.sanitizeFilename("folder\\file.pdf");
        });
    }

    @Test
    public void testSanitizeFilenameEmptyFallback() {
        String result = fileStorageService.sanitizeFilename("");
        assertTrue(result.startsWith("document_") && result.endsWith(".pdf"));

        String resultNull = fileStorageService.sanitizeFilename(null);
        assertTrue(resultNull.startsWith("document_") && resultNull.endsWith(".pdf"));
    }

    @Test
    public void testValidatePdfSuccess() {
        MockMultipartFile file = new MockMultipartFile("files", "test.pdf", "application/pdf", "pdf content".getBytes());
        assertDoesNotThrow(() -> fileStorageService.validatePdf(file));
    }

    @Test
    public void testValidatePdfFallbackOnExtension() {
        // Content type is not application/pdf, but filename has .pdf extension
        MockMultipartFile file = new MockMultipartFile("files", "test.pdf", "text/plain", "pdf content".getBytes());
        assertDoesNotThrow(() -> fileStorageService.validatePdf(file));
    }

    @Test
    public void testValidatePdfFailure() {
        MockMultipartFile file = new MockMultipartFile("files", "test.txt", "text/plain", "text content".getBytes());
        assertThrows(IllegalArgumentException.class, () -> fileStorageService.validatePdf(file));
    }
}
