package com.avgmax.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;

@Configuration
public class MultipartConfig {

    // 메소드 이름을 반드시!! multipartResolver로 해줘야됨
    @Bean
    public CommonsMultipartResolver multipartResolver() {
        CommonsMultipartResolver resolver = new CommonsMultipartResolver();
        resolver.setMaxUploadSizePerFile(5 * 1024 * 1024); // 파일 하나당 5MB 제한
        resolver.setMaxUploadSize(25 * 1024 * 1024);       // 전체 요청은 20MB까지
        resolver.setDefaultEncoding("UTF-8");
        return resolver;
    }
}
