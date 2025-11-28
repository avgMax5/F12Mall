package com.avgmax.user.service;

import java.util.List;
import java.util.UUID;
import java.util.ArrayList;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.avgmax.global.service.MinioService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {
    private final MinioService minioService;

    public List<String> uploadForUser(List<MultipartFile> files) {
        List<String> urls = new ArrayList<>();

        for (MultipartFile file : files) {
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            try {
                log.info("업로드 : {}", filename);
                String url = minioService.uploadFile(
                        filename,
                        file.getInputStream(),
                        file.getSize(),
                        file.getContentType());
                urls.add(url);
            } catch (Exception e) {
                log.warn("업로드 실패: {}", filename, e);
                urls.add(filename + " - 업로드 실패");
                continue;
            }
        }

        return urls;
    }
}