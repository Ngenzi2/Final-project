package com.examgov.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final Path UPLOAD_ROOT = Paths.get("uploads");

    public String store(String subfolder, Long ownerId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        try {
            Path targetDir = UPLOAD_ROOT.resolve(subfolder).resolve(String.valueOf(ownerId));
            Files.createDirectories(targetDir);

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String safeName = UUID.randomUUID() + "-" + originalName.replaceAll("[^a-zA-Z0-9.\\-_]", "_");
            Path targetFile = targetDir.resolve(safeName);
            file.transferTo(targetFile);

            return subfolder + "/" + ownerId + "/" + safeName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }
}
