package com.docuvault.dto;

public class AsyncUploadResponse {
    private String batchId;
    private int fileCount;
    private String status;

    public AsyncUploadResponse() {}

    public AsyncUploadResponse(String batchId, int fileCount, String status) {
        this.batchId = batchId;
        this.fileCount = fileCount;
        this.status = status;
    }

    public String getBatchId() {
        return batchId;
    }

    public void setBatchId(String batchId) {
        this.batchId = batchId;
    }

    public int getFileCount() {
        return fileCount;
    }

    public void setFileCount(int fileCount) {
        this.fileCount = fileCount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
